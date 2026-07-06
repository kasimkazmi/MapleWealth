import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export class AddApprovedHoldingDto {
  symbol!: string;
}

// Used by rules.service.ts whenever a user has configured zero approved holdings,
// so existing users see no behavior change until they actively customize their list.
export const DEFAULT_APPROVED_HOLDINGS = ['XEQT', 'VEQT', 'VGRO'];

@Injectable()
export class InvestmentPolicyService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string): Promise<string[]> {
    const rows = await this.prisma.approvedHolding.findMany({
      where: { userId },
      orderBy: { symbol: 'asc' },
    });
    return rows.map((r) => r.symbol);
  }

  async add(userId: string, data: AddApprovedHoldingDto): Promise<string[]> {
    const symbol = data.symbol.trim().toUpperCase();
    if (!symbol) {
      throw new ConflictException('Symbol cannot be empty.');
    }

    try {
      await this.prisma.approvedHolding.create({
        data: { userId, symbol },
      });
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code?: string }).code === 'P2002'
      ) {
        throw new ConflictException(
          `${symbol} is already in your approved list.`,
        );
      }
      throw err;
    }

    return this.findAll(userId);
  }

  async remove(userId: string, symbol: string): Promise<string[]> {
    const normalized = symbol.trim().toUpperCase();
    const existing = await this.prisma.approvedHolding.findFirst({
      where: { userId, symbol: normalized },
    });
    if (!existing) {
      throw new NotFoundException(
        `${normalized} is not in your approved list.`,
      );
    }
    await this.prisma.approvedHolding.delete({ where: { id: existing.id } });
    return this.findAll(userId);
  }
}
