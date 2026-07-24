import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../../server/auth";
import CreditCardsClient from "./CreditCardsClient";

export default async function CreditCardsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user) {
    redirect("/login");
  }

  return <CreditCardsClient />;
}
