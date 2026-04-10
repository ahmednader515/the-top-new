"use client";

import { usePathname } from "next/navigation";

import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { MobileTopNav } from "./mobile-top-nav";
import { MobileBottomNav } from "./mobile-bottom-nav";

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isStaffDashboard =
    pathname?.startsWith("/dashboard/admin") ||
    pathname?.startsWith("/dashboard/teacher") ||
    pathname?.startsWith("/dashboard/admin-assistant");

  const isCourseChapterView = Boolean(
    pathname?.startsWith("/courses/") && pathname?.includes("/chapters/")
  );

  return (
    <div className="min-h-screen flex flex-col dashboard-layout">
      {!isCourseChapterView && <MobileTopNav />}

      {isStaffDashboard && (
        <div className="hidden md:block h-[80px] fixed inset-x-0 top-0 z-50">
          <Navbar />
        </div>
      )}

      {!isCourseChapterView && (
        <div
          className={
            isStaffDashboard
              ? "hidden md:flex h-[calc(100vh-80px)] w-56 flex-col fixed top-[80px] rtl:right-0 ltr:left-0 z-40"
              : "hidden md:flex h-screen w-56 flex-col fixed inset-y-0 rtl:right-0 ltr:left-0 z-40"
          }
        >
          <Sidebar />
        </div>
      )}

      <main
        className={
          isCourseChapterView
            ? "pt-0 flex-1 pb-0"
            : isStaffDashboard
              ? "pt-[62px] md:pt-[80px] md:rtl:pr-56 md:ltr:pl-56 flex-1 pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-0"
              : "pt-[72px] md:pt-0 md:rtl:pr-56 md:ltr:pl-56 flex-1 pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-0"
        }
      >
        {children}
      </main>

      {!isCourseChapterView && <MobileBottomNav />}
    </div>
  );
}
