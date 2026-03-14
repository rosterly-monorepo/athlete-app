"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OrganizationSwitcher } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LayoutDashboard, Users, Settings, Menu, UserPlus, Search } from "lucide-react";

const navItems = [
  { href: "/coach/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/coach/search", label: "Search", icon: Search },
  { href: "/coach/recruiting", label: "Recruiting", icon: UserPlus },
  { href: "/coach/roster", label: "Roster", icon: Users },
  { href: "/coach/settings", label: "Settings", icon: Settings },
];

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* Organization switcher — for coaches at multiple schools */}
      <div className="mb-6 px-2">
        <OrganizationSwitcher
          hidePersonal
          appearance={{
            elements: {
              rootBox: "w-full",
              organizationSwitcherTrigger: "w-full justify-between",
            },
          }}
        />
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "justify-start gap-3",
                isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"
              )}
              asChild
              onClick={onNavigate}
            >
              <Link href={item.href}>
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>
    </>
  );
}

export function CoachNavSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile nav trigger */}
      <div className="fixed right-4 bottom-4 z-50 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <SheetHeader>
              <SheetTitle>Coach Navigation</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <NavContent onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside className="border-border/50 bg-card/50 hidden w-64 border-r p-4 md:block">
        <NavContent />
      </aside>
    </>
  );
}
