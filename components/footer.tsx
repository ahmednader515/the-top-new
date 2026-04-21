"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export const Footer = () => {
  const pathname = usePathname();

  // Student dashboard has its own support button (no footer bar).
  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  const isTeacherOrAdminDashboard =
    pathname?.startsWith("/dashboard/teacher") ||
    pathname?.startsWith("/dashboard/admin");

  if (isTeacherOrAdminDashboard) {
    return null;
  }

  const hasSidebar =
    pathname?.startsWith("/dashboard") || pathname?.startsWith("/courses");

  return (
    <footer className="border-t py-6">
      <div className="container mx-auto px-4">
        <div
          className={`text-center text-muted-foreground ${
            hasSidebar
              ? "md:rtl:pr-56 md:ltr:pl-56 lg:rtl:pr-80 lg:ltr:pl-80"
              : ""
          }`}
        >
          <div className="mb-4 flex flex-wrap justify-center gap-4">
            <a
              href="https://wa.me/201112970189"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-lg border-2 border-brand/20 bg-brand/10 px-4 py-2 transition-colors hover:bg-brand/20"
            >
              <p className="font-semibold text-brand">واتساب : 01112970189</p>
            </a>
          </div>

          <nav className="mb-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
            <Link className="hover:text-foreground underline-offset-4 hover:underline" href="/terms">
              الشروط والأحكام
            </Link>
            <Link className="hover:text-foreground underline-offset-4 hover:underline" href="/privacy">
              سياسة الخصوصية
            </Link>
            <Link className="hover:text-foreground underline-offset-4 hover:underline" href="/refund">
              سياسة الاسترجاع
            </Link>
            <Link className="hover:text-foreground underline-offset-4 hover:underline" href="/contact">
              بيانات التواصل والعنوان
            </Link>
          </nav>

          <p>© {new Date().getFullYear()} Mordesu Studio. جميع الحقوق محفوظة</p>
        </div>
      </div>
    </footer>
  );
};
