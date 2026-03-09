import { NavSidebar } from "@/components/composed/nav-sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-10rem)]">
      <NavSidebar />
      <div className="flex-1 p-6 sm:p-8">{children}</div>
    </div>
  );
}
