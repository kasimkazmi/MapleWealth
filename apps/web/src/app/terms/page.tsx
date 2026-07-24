import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | MapleWealth",
};

export default function TermsPage() {
  const updated = "July 24, 2026";

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-base underline" style={{ color: "var(--accent-2)" }}>
          ← Back to MapleWealth
        </Link>

        <h1 className="text-4xl mt-6 mb-2">Terms &amp; Conditions</h1>
        <p className="text-sm mb-10" style={{ opacity: 0.6 }}>
          Last updated: {updated}
        </p>

        <div className="hd-card p-6 md:p-8 space-y-8">
          <section>
            <h2 className="text-2xl mb-2">1. Acceptance of terms</h2>
            <p className="text-base" style={{ opacity: 0.85 }}>
              By creating an account or using MapleWealth (the "Service"), you agree to these
              Terms &amp; Conditions. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl mb-2">2. Not financial advice</h2>
            <p className="text-base" style={{ opacity: 0.85 }}>
              MapleWealth is a self-directed tracking and planning tool. It is <strong>not</strong>{" "}
              a licensed financial advisor, and nothing in the Service constitutes personalized
              financial, tax, legal, or investment advice. The Service does not recommend trading,
              market timing, or speculative investments. Figures, projections, and "next best
              action" suggestions are generated from the data you provide and general rules of
              thumb — they may be incomplete, delayed, or inaccurate, and should not be relied on
              as your sole basis for financial decisions. Consult a licensed professional for
              advice specific to your situation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl mb-2">3. Your account</h2>
            <p className="text-base" style={{ opacity: 0.85 }}>
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activity under your account. You must provide accurate information and
              notify us promptly of any unauthorized use.
            </p>
          </section>

          <section>
            <h2 className="text-2xl mb-2">4. Your data</h2>
            <p className="text-base" style={{ opacity: 0.85 }}>
              You retain all ownership rights to the financial data you enter into the Service.
              We do not claim ownership of your data and only use it to operate the Service for
              you, as described in our{" "}
              <Link href="/privacy" className="underline" style={{ color: "var(--accent-2)" }}>
                Privacy Policy
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl mb-2">5. Intellectual property</h2>
            <p className="text-base" style={{ opacity: 0.85 }}>
              The MapleWealth name, logo, and the Service's software, design, and content
              (excluding data you provide) are the property of MapleWealth and its licensors and
              are protected by copyright and other intellectual property laws. You may not copy,
              modify, reverse-engineer, redistribute, or create derivative works of the Service
              beyond what is expressly permitted by an applicable open-source license (if any is
              published for the underlying codebase) or by our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl mb-2">6. Acceptable use</h2>
            <p className="text-base" style={{ opacity: 0.85 }}>
              You agree not to: use the Service for any unlawful purpose; attempt to gain
              unauthorized access to other accounts or systems; interfere with or disrupt the
              Service's operation; or scrape, resell, or redistribute the Service or its content
              without authorization.
            </p>
          </section>

          <section>
            <h2 className="text-2xl mb-2">7. Disclaimer of warranties</h2>
            <p className="text-base" style={{ opacity: 0.85 }}>
              The Service is provided "as is" and "as available," without warranties of any kind,
              whether express or implied, including but not limited to accuracy, reliability, or
              fitness for a particular purpose. We do not guarantee the Service will be
              uninterrupted, error-free, or that calculations will be free of mistakes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl mb-2">8. Limitation of liability</h2>
            <p className="text-base" style={{ opacity: 0.85 }}>
              To the maximum extent permitted by law, MapleWealth and its creators are not liable
              for any indirect, incidental, or consequential damages, including financial losses,
              arising from your use of or reliance on the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl mb-2">9. Changes to the Service or these terms</h2>
            <p className="text-base" style={{ opacity: 0.85 }}>
              We may modify the Service or these Terms at any time. Material changes will be
              reflected by updating the "Last updated" date above; continued use of the Service
              after changes constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl mb-2">10. Governing law</h2>
            <p className="text-base" style={{ opacity: 0.85 }}>
              These Terms are governed by the laws of Canada, without regard to conflict-of-law
              principles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl mb-2">11. Contact</h2>
            <p className="text-base" style={{ opacity: 0.85 }}>
              Questions about these Terms?{" "}
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
