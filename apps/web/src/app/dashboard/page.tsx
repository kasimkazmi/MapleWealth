import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "../../server/auth";
import DashboardClient from "../DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard | MapleWealth",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  return <DashboardClient />;
}
