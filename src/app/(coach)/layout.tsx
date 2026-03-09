import { CoachNavSidebar } from "@/components/composed/coach-nav-sidebar";

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-10rem)]">
      <CoachNavSidebar />
      <div className="flex-1 p-6 sm:p-8">{children}</div>
    </div>
  );
}
