"use client";

import React from "react";
import Link from "next/link";
import { SignInButton, Show } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { BrandImage } from "@/components/composed/brand-image";
import { AnimatedGroup } from "@/components/ui/animated-group";

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring" as const,
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

export function HeroSection() {
  return (
    <main className="overflow-hidden">
      <section>
        <div className="relative pt-24 md:pt-36">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center sm:mx-auto lg:mt-0 lg:mr-auto">
              <AnimatedGroup variants={transitionVariants}>
                <div className="mx-auto mt-8 flex justify-center lg:mt-16">
                  <BrandImage className="h-16 w-auto md:h-20" priority />
                </div>

                <div className="mt-12 flex justify-center">
                  <Show
                    when="signed-out"
                    fallback={
                      <div className="bg-foreground/10 rounded-[14px] border p-0.5">
                        <Button asChild size="lg" className="rounded-xl px-5 text-base">
                          <Link href="/dashboard">
                            <span className="text-nowrap">Go to Dashboard</span>
                          </Link>
                        </Button>
                      </div>
                    }
                  >
                    <SignInButton>
                      <Button size="lg" className="rounded-xl px-5 text-base">
                        <span className="text-nowrap">Sign In</span>
                      </Button>
                    </SignInButton>
                  </Show>
                </div>
              </AnimatedGroup>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
