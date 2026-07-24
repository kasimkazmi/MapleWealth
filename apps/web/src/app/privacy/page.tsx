import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | MapleWealth",
};

export default function PrivacyPage() {
  const updated = "July 24, 2026";

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-base underline" style={{ color: "var(--accent-2)" }}>
          ← Back to MapleWealth
        </Link>

        <h1 className="text-4xl mt-6 mb-2">Privacy Policy</h1>
        <p className="text-sm mb-10" style={{ opacity: 0.6 }}>
          Last updated: {updated}
        </p>

        <div className="hd-card p-6 md:p-8 space-y-8">
          <section>
            <h2 className="text-2xl mb-2">1. What this covers</h2>
            <p className="text-base" style={{ opacity: 0.85 }}>
              This policy describes what information MapleWealth ("we," "us") collects when you
              use the MapleWealth application (the "Service"), and how that information is
              stored and used. MapleWealth is a self-hosted, single-user-oriented personal
              finance tool — if you are running your own instance, you are the data controller
              for your own deployment, and this policy describes the default behavior of the
              software itself.
            </p>
          </section>

          <section>
            <h2 className="text-2xl mb-2">2. Information we collect</h2>
            <ul className="list-disc pl-5 space-y-2 text-base" style={{ opacity: 0.85 }}>
              <li><strong>Account information</strong>: name, email address, and a securely hashed password (or OAuth identifier) when you create an account.</li>
              <li><strong>Financial data you enter</strong>: account balances, transactions, holdings, dividends, goals, and related figures you manually add or import via CSV. MapleWealth does not connect to your bank automatically — nothing is retrieved without you entering or uploading it.</li>
              <li><strong>Usage data</strong>: basic technical logs (timestamps, request metadata, error logs) used to operate and secure the Service.</li>
              <li><strong>Payment information</strong>: if you subscribe to a paid tier, billing is handled by our payment processor (Stripe); we do not store your full card number.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl mb-2">3. How we use your information</h2>
            <p className="text-base" style={{ opacity: 0.85 }}>
              Data you provide is used solely to operate the Service for you: calculating net
              worth, contribution room, dividend/ACB tracking, and the recommendations shown in
              the app. We do not sell your personal or financial data, and we do not use your
              financial data to train third-party models or for advertising targeting.
            </p>
          </section>

          <section>
            <h2 className="text-2xl mb-2">4. Data storage and security</h2>
            <p className="text-base" style={{ opacity: 0.85 }}>
              Financial data is stored in a PostgreSQL database associated with your account (or,
              if self-hosted, your own database instance). We use industry-standard practices
              (hashed credentials, encrypted connections) to protect data in transit and at rest,
              but no system is perfectly secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl mb-2">5. Your choices</h2>
            <p className="text-base" style={{ opacity: 0.85 }}>
              You can export or permanently delete your account and associated data at any time
              from account settings. Deletion removes your data from active systems; residual
              copies in backups are purged on our standard backup rotation schedule.
            </p>
          </section>

          <section>
            <h2 className="text-2xl mb-2">6. Third-party services</h2>
            <p className="text-base" style={{ opacity: 0.85 }}>
              We use a limited set of third-party providers to operate the Service (for example,
              hosting, error monitoring, and payment processing). These providers only receive
              the minimum data needed to perform their function and are not permitted to use it
              for their own purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl mb-2">7. Changes to this policy</h2>
            <p className="text-base" style={{ opacity: 0.85 }}>
              We may update this policy as the Service evolves. Material changes will be reflected
              by updating the "Last updated" date above.
            </p>
          </section>

          <section>
            <h2 className="text-2xl mb-2">8. Contact</h2>
            <p className="text-base" style={{ opacity: 0.85 }}>
              Questions about this policy?{" "}
              <a href="mailto:hello@maplewealth.app" className="underline" style={{ color: "var(--accent-2)" }}>
                hello@maplewealth.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
