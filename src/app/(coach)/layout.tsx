"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { CoachNavSidebar } from "@/components/composed/coach-nav-sidebar";
import { getMyOrganization } from "@/services/organization";

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { getToken } = useAuth();
  const isOnboardingPage = pathname === "/coach/onboarding";

  const { data: org, isLoading } = useQuery({
    queryKey: ["organization", "me"],
    queryFn: async () => {
      const token = await getToken();
      return getMyOrganization(token!);
    },
  });

  useEffect(() => {
    if (isLoading || !org) return;

    // Redirect to onboarding if not completed (unless already there)
    if (!org.onboarding_completed_at && !isOnboardingPage) {
      router.replace("/coach/onboarding");
    }

    // Redirect away from onboarding if already completed
    if (org.onboarding_completed_at && isOnboardingPage) {
      router.replace("/coach/dashboard");
    }
  }, [org, isLoading, isOnboardingPage, router]);

  // On the onboarding page, render without sidebar
  if (isOnboardingPage) {
    return <div className="flex-1 p-6 sm:p-8">{children}</div>;
  }

  return (
    <div className="flex min-h-[calc(100vh-10rem)]">
      <CoachNavSidebar />
      <div className="min-w-0 flex-1 p-6 sm:p-8">{children}</div>
    </div>
  );
}
