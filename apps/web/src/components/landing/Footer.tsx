const productLinks = [
  { label: "The Priority Ladder", href: "#priority-ladder" },
  { label: "Features", href: "#features" },
  { label: "See it in action", href: "#product-tour" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Questions", href: "#faq" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="footer"
      className="min-h-screen snap-start flex flex-col justify-center px-4 py-16"
      style={{ borderTop: "2px dashed var(--border)" }}
    >
      <div className="max-w-5xl mx-auto w-full">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          <div>
            <img src="/logo.png" alt="MapleWealth Logo" className="w-20 object-contain mb-3" />
            <p className="text-base" style={{ opacity: 0.75 }}>
              A Canadian-first personal finance dashboard. Emergency Fund → TFSA → FHSA → RRSP,
              in that order, every time.
            </p>
          </div>

          <div>
            <h3 className="text-lg mb-3">Product</h3>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-base underline" style={{ color: "var(--accent-2)" }}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg mb-3">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-base underline" style={{ color: "var(--accent-2)" }}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg mb-3">Contact</h3>
            <p className="text-base" style={{ opacity: 0.75 }}>
              Questions or feedback?
              <br />
              <a
                href="mailto:hello@maplewealth.app"
                className="underline"
                style={{ color: "var(--accent-2)" }}
              >
                hello@maplewealth.app
              </a>
            </p>
          </div>
        </div>

        <div
          className="pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-sm"
          style={{ borderTop: "2px dashed var(--border)", opacity: 0.6 }}
        >
          <p>© {year} MapleWealth. Not a licensed financial advisor.</p>
          <p>Nothing here is personalized financial advice.</p>
        </div>
      </div>
    </footer>
  );
}
