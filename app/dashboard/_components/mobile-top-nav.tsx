"use client";

import Link from "next/link";
import { Download, MessageCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { Logo } from "./logo";
import { NavbarRoutes } from "@/components/navbar-routes";

const WHATSAPP_URL = "https://wa.me/201112970189";
const APP_DOWNLOAD_URL =
  "https://download2289.mediafire.com/4xwbxvmhylrgFW2Ky-0fWn9Y_pvhyuyHs5Cmzo-qxe4bu14nYJaFOboeKfEw1ASwzMFfpW747ntWo5d0YilZSJlpasc2GOggdbKcapIEa5C2SEinMsHcL2GEDSU0lOgSff3BAJv_W2yGAYgSdQP_bbmws4lfNLcDA3IdM_wAiLTukA/tmmzb8imjktk1v3/theTop.apk";

export function MobileTopNav() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;
  const role = session?.user?.role;
  if (!role) return null;

  const isStaff =
    role === "ADMIN" ||
    role === "TEACHER" ||
    role === "ADMIN_ASSISTANT";
  const isStudent = role === "STUDENT" || role === "USER";

  if (isStaff) {
    return (
      <header className="fixed inset-x-0 top-0 z-50 h-[62px] border-b border-border/80 bg-card/95 px-3 backdrop-blur md:hidden">
        <div className="mx-auto flex h-full max-w-lg items-center justify-between" dir="rtl">
          <div className="flex shrink-0 items-center">
            <Logo />
          </div>
          <div className="flex items-center gap-1 text-xs [&_button]:h-9 [&_button]:px-2.5 [&_button]:text-xs">
            <NavbarRoutes />
          </div>
        </div>
      </header>
    );
  }

  if (!isStudent) return null;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/80 bg-card/95 px-3 py-2 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between" dir="rtl">
        <Link
          href={APP_DOWNLOAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-black px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Download className="h-4 w-4" />
          حمل التطبيق
        </Link>
        <Link
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-2 rounded-md border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
        >
          <MessageCircle className="h-4 w-4 text-green-600" />
          تواصل معنا
        </Link>
      </div>
    </header>
  );
}
