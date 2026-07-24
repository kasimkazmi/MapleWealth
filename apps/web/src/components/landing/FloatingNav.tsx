import Link from "next/link";

export function FloatingNav() {
  return (
    <div className="fixed top-4 right-4 md:top-6 md:right-6 z-50">
      <Link href="/login" className="hd-btn px-5 py-2 text-base">
        Log In
      </Link>
    </div>
  );
}
