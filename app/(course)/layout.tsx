"use client";

import { DashboardLayoutClient } from "@/app/dashboard/_components/dashboard-layout-client";

const CourseLayout = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return (
        <DashboardLayoutClient>{children}</DashboardLayoutClient>
    );
}

export default CourseLayout; 