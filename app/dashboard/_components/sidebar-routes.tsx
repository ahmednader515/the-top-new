"use client";

import { Suspense } from "react";
import { BarChart, Compass, Layout, List, Wallet, Users, FileText, Ticket } from "lucide-react";
import { SidebarItem } from "./sidebar-item";
import { usePathname, useSearchParams } from "next/navigation";

const guestRoutes = [
    {
        icon: Layout,
        label: "المحتوى الدراسي",
        href: "/dashboard",
    },
    {
        icon: Compass,
        label: "الكورسات",
        href: "/dashboard/ask-teacher",
    },
    {
        icon: Wallet,
        label: "الاشتراكات",
        href: "/dashboard/subscriptions",
    },
];

const adminRoutes = [
    {
        icon: List,
        label: "الكورسات و الأشتراكات",
        href: "/dashboard/admin/courses",
    },
    {
        icon: FileText,
        label: "الاختبارات والدرجات",
        href: "/dashboard/admin/assessments",
    },
    {
        icon: BarChart,
        label: "الاحصائيات",
        href: "/dashboard/admin/analytics",
    },
    {
        icon: Users,
        label: "إدارة الطلاب والحسابات",
        href: "/dashboard/admin/management",
    },
    {
        icon: Ticket,
        label: "الاكواد",
        href: "/dashboard/admin/codes",
    },
];

const teacherRoutes = [
    {
        icon: List,
        label: "كورساتي",
        href: "/dashboard/teacher/courses",
    },
    {
        icon: FileText,
        label: "الاختبارات",
        href: "/dashboard/teacher/assessments",
    },
    {
        icon: BarChart,
        label: "تقدم الطلاب",
        href: "/dashboard/teacher/progress",
    },
    {
        icon: Users,
        label: "إدارة الطلاب",
        href: "/dashboard/teacher/management",
    },
];

function SidebarRoutesInner({ closeOnClick = false }: { closeOnClick?: boolean }) {
    const pathName = usePathname();
    const searchParams = useSearchParams();
    const urlSearch = searchParams.toString();

    const isTeacherPage = pathName?.includes("/dashboard/teacher") || pathName?.includes("/dashboard/admin-assistant");
    const isAdminPage = pathName?.includes("/dashboard/admin");
    const routes = isTeacherPage ? teacherRoutes : isAdminPage ? adminRoutes : guestRoutes;

    return (
        <div className="flex w-full flex-col pt-0">
            {routes.map((route) => (
                <SidebarItem
                  key={`${route.label}-${route.href}`}
                  icon={route.icon}
                  label={route.label}
                  href={route.href}
                  urlSearch={urlSearch}
                  closeOnClick={closeOnClick}
                />
            ))}
        </div>
    );
}

export function SidebarRoutes({ closeOnClick = false }: { closeOnClick?: boolean }) {
    return (
        <Suspense fallback={<div className="flex w-full flex-col pt-0" aria-hidden />}>
            <SidebarRoutesInner closeOnClick={closeOnClick} />
        </Suspense>
    );
}