"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BookOpen, CircleHelp, LogOut, MessageCircle, UserRound, Wallet } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { SidebarRoutes } from "./sidebar-routes";
import { cn } from "@/lib/utils";

const WHATSAPP_URL = "https://wa.me/201112970189";
const APP_DOWNLOAD_URL =
  "https://download2289.mediafire.com/4xwbxvmhylrgFW2Ky-0fWn9Y_pvhyuyHs5Cmzo-qxe4bu14nYJaFOboeKfEw1ASwzMFfpW747ntWo5d0YilZSJlpasc2GOggdbKcapIEa5C2SEinMsHcL2GEDSU0lOgSff3BAJv_W2yGAYgSdQP_bbmws4lfNLcDA3IdM_wAiLTukA/tmmzb8imjktk1v3/theTop.apk";

const studentButtons = [
  { label: "المحتوى الدراسي", href: "/dashboard", icon: BookOpen },
  { label: "اسأل مدرس", href: "/dashboard/ask-teacher", icon: CircleHelp },
  { label: "الاشتراكات", href: "/dashboard/subscriptions", icon: Wallet },
  { label: "حسابي", href: "/dashboard/profile", icon: UserRound },
];

export const Sidebar = ({ closeOnClick = false }: { closeOnClick?: boolean }) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isStaffDashboard =
    pathname?.startsWith("/dashboard/admin") ||
    pathname?.startsWith("/dashboard/admin-assistant") ||
    pathname?.startsWith("/dashboard/teacher");
  const isStudent = session?.user?.role === "STUDENT" || session?.user?.role === "USER";

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      await signOut({ callbackUrl: "/" });
    }
  };

  if (isStaffDashboard || !isStudent) {
    return (
      <div className="h-full border-r flex flex-col overflow-y-auto bg-card shadow-sm">
        <div className="flex flex-col w-full rtl:border-l-2 ltr:border-r-2 pt-0">
          <SidebarRoutes closeOnClick={closeOnClick} />
        </div>
      </div>
    );
  }

  return (
    <aside className="h-full border-r bg-card shadow-sm p-3 flex flex-col gap-4">
      <div className="flex justify-center">
        <Image src="/logo.png" alt="Logo" width={120} height={48} className="object-contain" unoptimized />
      </div>

      <div className="rounded-xl border bg-white p-3 space-y-2">
        <p className="text-sm font-semibold text-brand text-center">حمل التطبيق</p>
        <a
          href={APP_DOWNLOAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg bg-black text-white text-center py-2 text-xs font-medium hover:bg-black/90 transition"
        >
          حمل التطبيق الان
        </a>
      </div>

      <div className="space-y-2">
        {studentButtons.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-md border px-3 py-2 text-sm transition",
                isActive
                  ? "border-sky-300 bg-sky-100 text-sky-700 font-semibold"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto space-y-2">
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition"
        >
          <MessageCircle className="h-4 w-4" />
          تواصل معنا
        </a>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition"
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
};