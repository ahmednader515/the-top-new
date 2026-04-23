import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import HomePageClient from "@/app/_components/home-page-client";
import { authOptions } from "@/lib/auth";
import { getDashboardUrlByRole } from "@/lib/utils";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const isValidSession = session?.user?.id && session.user.id !== "";

  if (isValidSession) {
    const dashboardUrl = getDashboardUrlByRole(session.user.role || "STUDENT");
    redirect(dashboardUrl);
  }

  return <HomePageClient />;
}