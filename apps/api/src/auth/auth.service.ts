import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const CREDENTIALS_PROVIDER = 'credentials';

export class RegisterDto {
  email!: string;
  password!: string;
  name?: string;
}

export class LoginDto {
  email!: string;
  password!: string;
}

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(data: RegisterDto) {
    const email = data.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }
    if (!data.password || data.password.length < 8) {
      throw new UnauthorizedException(
        'Password must be at least 8 characters.',
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email,
        name: data.name,
      },
    });

    await this.prisma.authAccount.create({
      data: {
        userId: user.id,
        accountId: user.id,
        providerId: CREDENTIALS_PROVIDER,
        password: passwordHash,
      },
    });

    // Seed an empty financial profile so the dashboard has something to load
    // immediately after signup instead of 404ing on a missing profile.
    await this.prisma.financialProfile.create({
      data: {
        userId: user.id,
        annualSalary: 0,
        monthlyTakeHome: 0,
        monthlyExpenses: 0,
        savingsCapacity: 0,
      },
    });

    return { id: user.id, email: user.email, name: user.name };
  }

  async login(data: LoginDto, ipAddress?: string, userAgent?: string) {
    const email = data.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Use the same generic error whether the user doesn't exist or the password is wrong,
    // to avoid leaking which emails are registered.
    const invalidCredentials = () =>
      new UnauthorizedException('Invalid email or password.');
    if (!user) {
      throw invalidCredentials();
    }

    const authAccount = await this.prisma.authAccount.findFirst({
      where: { userId: user.id, providerId: CREDENTIALS_PROVIDER },
    });
    if (!authAccount || !authAccount.password) {
      throw invalidCredentials();
    }

    const passwordMatches = await bcrypt.compare(
      data.password,
      authAccount.password,
    );
    if (!passwordMatches) {
      throw invalidCredentials();
    }

    // Single active session per user: signing in anywhere else immediately signs the
    // user out everywhere else by invalidating all of their existing sessions first.
    await this.prisma.session.deleteMany({ where: { userId: user.id } });

    const token = randomBytes(32).toString('hex');
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
        ipAddress,
        userAgent,
      },
    });

    return {
      token: session.token,
      expiresAt: session.expiresAt,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }

  async logout(token: string) {
    await this.prisma.session.deleteMany({ where: { token } });
    return { success: true };
  }

  async validateSession(token: string) {
    const session = await this.prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!session || session.expiresAt.getTime() < Date.now()) {
      if (session) {
        // Clean up the expired session row.
        await this.prisma.session
          .delete({ where: { id: session.id } })
          .catch(() => undefined);
      }
      throw new UnauthorizedException(
        'Session expired or invalid. Please log in again.',
      );
    }
    return session.user;
  }
}
