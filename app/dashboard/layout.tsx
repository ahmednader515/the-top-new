import { DashboardLayoutClient } from "./_components/dashboard-layout-client";

const DashboardLayout = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
};
 
export default DashboardLayout;