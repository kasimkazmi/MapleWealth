import Link from "next/link";

export function ClosingCta() {
  return (
    <section
      id="get-started"
      className="min-h-screen snap-start flex flex-col justify-center px-4 py-16 text-center"
      style={{ background: "var(--muted)" }}
    >
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl mb-4">Ready to see your priority?</h2>
        <p className="text-lg mb-8" style={{ opacity: 0.8 }}>
          Free to start. No credit card, no upsell.
        </p>
        <Link href="/signup" className="hd-btn px-8 py-3 text-xl">
          Get Started Free
        </Link>
      </div>
    </section>
  );
}
