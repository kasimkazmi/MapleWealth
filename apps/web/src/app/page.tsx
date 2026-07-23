import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../server/auth";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  // Convert Next.js ReadonlyHeaders to standard Headers to ensure compatibility with better-auth
  const reqHeaders = new Headers(await headers());
  const session = await auth.api.getSession({ headers: reqHeaders });
  
  if (!session?.user) {
    redirect("/login");
  }

  return <DashboardClient />;
}
