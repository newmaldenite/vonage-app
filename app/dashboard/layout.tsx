import { SidebarDemo } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <SidebarDemo />
      <div className="flex-1">{children}</div>
    </div>
  );
}
