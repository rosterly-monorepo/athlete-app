"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SignInButton, SignUpButton, Show } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
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
      {/* Ambient light effects */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 isolate z-[2] hidden opacity-50 contain-strict lg:block"
      >
        <div className="absolute top-0 left-0 h-[80rem] w-[35rem] -translate-y-[350px] -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(245,80%,75%,.08)_0,hsla(245,60%,55%,.02)_50%,hsla(245,40%,45%,0)_80%)]" />
        <div className="absolute top-0 left-0 h-[80rem] w-56 [translate:5%_-50%] -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(245,80%,75%,.06)_0,hsla(245,40%,45%,.02)_80%,transparent_100%)]" />
        <div className="absolute top-0 left-0 h-[80rem] w-56 -translate-y-[350px] -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(245,80%,75%,.04)_0,hsla(245,40%,45%,.02)_80%,transparent_100%)]" />
      </div>

      <section>
        <div className="relative pt-24 md:pt-36">
          {/* Background image */}
          <AnimatedGroup
            variants={{
              container: {
                visible: {
                  transition: {
                    delayChildren: 1,
                  },
                },
              },
              item: {
                hidden: {
                  opacity: 0,
                  y: 20,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    type: "spring" as const,
                    bounce: 0.3,
                    duration: 2,
                  },
                },
              },
            }}
            className="absolute inset-0 -z-20"
          >
            <Image
              src="https://images.unsplash.com/photo-1461896836934-bd45ba054ca0?w=3276&q=80&auto=format"
              alt=""
              className="absolute inset-x-0 top-56 -z-20 hidden opacity-30 lg:top-32 dark:block"
              width={3276}
              height={4095}
              priority
              unoptimized
            />
          </AnimatedGroup>

          <div
            aria-hidden
            className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]"
          />

          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center sm:mx-auto lg:mt-0 lg:mr-auto">
              <AnimatedGroup variants={transitionVariants}>
                <Link
                  href="/athletes"
                  className="group bg-muted hover:bg-background dark:hover:border-t-border mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-black/5 transition-all duration-300 dark:border-t-white/5 dark:shadow-zinc-950"
                >
                  <span className="text-foreground text-sm">Browse athlete profiles</span>
                  <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>
                  <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                    <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                      <span className="flex size-6">
                        <ArrowRight className="m-auto size-3" />
                      </span>
                      <span className="flex size-6">
                        <ArrowRight className="m-auto size-3" />
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="mx-auto mt-8 flex justify-center lg:mt-16">
                  {/* Light theme: dark logo */}
                  <Image
                    src="/branding/logo-light.png"
                    alt="Rosterly"
                    width={400}
                    height={100}
                    className="h-16 w-auto md:h-20 dark:hidden"
                    priority
                  />
                  {/* Dark theme: light logo */}
                  <Image
                    src="/branding/logo-dark.png"
                    alt="Rosterly"
                    width={400}
                    height={100}
                    className="hidden h-16 w-auto md:h-20 dark:block"
                    priority
                  />
                </div>

                <h1 className="mx-auto mt-8 max-w-4xl text-6xl font-bold tracking-tight text-balance md:text-7xl xl:text-[5.25rem]">
                  Your Athletic Career Starts Here
                </h1>
                <p className="text-muted-foreground mx-auto mt-8 max-w-2xl text-lg text-balance">
                  Build your athletic profile, showcase your performance data, and get discovered by
                  college coaches across the country.
                </p>
              </AnimatedGroup>

              <AnimatedGroup
                variants={{
                  container: {
                    visible: {
                      transition: {
                        staggerChildren: 0.05,
                        delayChildren: 0.75,
                      },
                    },
                  },
                  ...transitionVariants,
                }}
                className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row"
              >
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
                  <div className="bg-foreground/10 rounded-[14px] border p-0.5">
                    <SignUpButton>
                      <Button size="lg" className="rounded-xl px-5 text-base">
                        <span className="text-nowrap">Get Started</span>
                      </Button>
                    </SignUpButton>
                  </div>
                  <SignInButton>
                    <Button size="lg" variant="ghost" className="h-10.5 rounded-xl px-5">
                      <span className="text-nowrap">Sign In</span>
                    </Button>
                  </SignInButton>
                </Show>
              </AnimatedGroup>
            </div>
          </div>

          {/* App screenshot */}
          <AnimatedGroup
            variants={{
              container: {
                visible: {
                  transition: {
                    staggerChildren: 0.05,
                    delayChildren: 0.75,
                  },
                },
              },
              ...transitionVariants,
            }}
          >
            <div className="relative mt-8 -mr-56 overflow-hidden px-2 sm:mt-12 sm:mr-0 md:mt-20">
              <div
                aria-hidden
                className="to-background absolute inset-0 z-10 bg-gradient-to-b from-transparent from-35%"
              />
              <div className="bg-background ring-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border p-4 shadow-lg ring-1 inset-shadow-2xs shadow-zinc-950/15 dark:inset-shadow-white/20">
                <Image
                  className="bg-background relative aspect-[15/8] rounded-2xl"
                  src="https://images.unsplash.com/photo-1461896836934-bd45ba054ca0?w=2700&h=1440&q=80&auto=format&fit=crop"
                  alt="Rosterly athlete dashboard"
                  width={2700}
                  height={1440}
                  unoptimized
                />
              </div>
            </div>
          </AnimatedGroup>
        </div>
      </section>

      {/* Stats section */}
      <section className="bg-background pt-16 pb-16 md:pb-32">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto grid max-w-2xl grid-cols-2 gap-x-12 gap-y-8 sm:grid-cols-4 sm:gap-x-16 sm:gap-y-14">
            <div className="text-center">
              <div className="text-foreground text-3xl font-bold">10K+</div>
              <div className="text-muted-foreground mt-1 text-sm">Athletes</div>
            </div>
            <div className="text-center">
              <div className="text-foreground text-3xl font-bold">500+</div>
              <div className="text-muted-foreground mt-1 text-sm">College Programs</div>
            </div>
            <div className="text-center">
              <div className="text-foreground text-3xl font-bold">25+</div>
              <div className="text-muted-foreground mt-1 text-sm">Sports</div>
            </div>
            <div className="text-center">
              <div className="text-foreground text-3xl font-bold">98%</div>
              <div className="text-muted-foreground mt-1 text-sm">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
