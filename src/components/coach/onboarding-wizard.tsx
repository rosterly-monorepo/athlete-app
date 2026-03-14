"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Check, X } from "lucide-react";
import {
  createProgram,
  updateProgram,
  completeOnboarding,
  type CreateProgramInput,
} from "@/services/organization";
import type { OrganizationProgram } from "@/services/types";
import { useUserRole } from "@/hooks/use-user-role";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const SPORTS = [
  { value: "rowing", label: "Rowing" },
  { value: "track_and_field", label: "Track & Field" },
  { value: "cross_country", label: "Cross Country" },
  { value: "swimming", label: "Swimming & Diving" },
  { value: "basketball", label: "Basketball" },
  { value: "football", label: "Football" },
  { value: "soccer", label: "Soccer" },
  { value: "baseball", label: "Baseball" },
  { value: "softball", label: "Softball" },
  { value: "volleyball", label: "Volleyball" },
  { value: "lacrosse", label: "Lacrosse" },
  { value: "tennis", label: "Tennis" },
  { value: "golf", label: "Golf" },
  { value: "hockey", label: "Hockey" },
  { value: "wrestling", label: "Wrestling" },
  { value: "other", label: "Other" },
];

const DIVISIONS = [
  { value: "NCAA_D1", label: "NCAA Division I" },
  { value: "NCAA_D2", label: "NCAA Division II" },
  { value: "NCAA_D3", label: "NCAA Division III" },
  { value: "NAIA", label: "NAIA" },
  { value: "JUCO", label: "JUCO" },
];

const CITIZENSHIP_OPTIONS = [
  { value: "us_only", label: "US Citizens Only" },
  { value: "international_ok", label: "Open to International" },
];

const CURRENT_YEAR = new Date().getFullYear();
const GRAD_YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR + i);

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface FormData {
  // Step 1: Program
  sport_code: string;
  division: string;
  conference: string;
  // Step 2: Requirements
  minimum_gpa: string;
  minimum_sat: string;
  minimum_act: string;
  minimum_height_inches: string;
  graduation_years_of_interest: number[];
  geographic_preferences: string;
  citizenship_requirements: string;
  roster_spots: string;
}

const INITIAL_FORM: FormData = {
  sport_code: "",
  division: "",
  conference: "",
  minimum_gpa: "",
  minimum_sat: "",
  minimum_act: "",
  minimum_height_inches: "",
  graduation_years_of_interest: [],
  geographic_preferences: "",
  citizenship_requirements: "",
  roster_spots: "",
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function OnboardingWizard() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { orgName } = useUserRole();
  const queryClient = useQueryClient();
  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState<FormData>(INITIAL_FORM);
  const [createdProgram, setCreatedProgram] = React.useState<OrganizationProgram | null>(null);

  const set = (field: keyof FormData, value: string | number[]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // ── Mutations ──

  const createProgramMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      const input: CreateProgramInput = {
        sport_code: form.sport_code,
        division: form.division || undefined,
        conference: form.conference || undefined,
      };
      return createProgram(token!, input);
    },
    onSuccess: (program) => {
      setCreatedProgram(program);
      setStep(1);
    },
  });

  const updateRequirementsMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!createdProgram) throw new Error("No program created");
      return updateProgram(token!, createdProgram.id, {
        minimum_gpa: form.minimum_gpa ? parseFloat(form.minimum_gpa) : undefined,
        minimum_sat: form.minimum_sat ? parseInt(form.minimum_sat, 10) : undefined,
        minimum_act: form.minimum_act ? parseInt(form.minimum_act, 10) : undefined,
        minimum_height_inches: form.minimum_height_inches
          ? parseInt(form.minimum_height_inches, 10)
          : undefined,
        graduation_years_of_interest:
          form.graduation_years_of_interest.length > 0
            ? form.graduation_years_of_interest
            : undefined,
        geographic_preferences: form.geographic_preferences
          ? form.geographic_preferences
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
        citizenship_requirements: form.citizenship_requirements || undefined,
        roster_spots: form.roster_spots ? parseInt(form.roster_spots, 10) : undefined,
      });
    },
    onSuccess: () => {
      setStep(2);
    },
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return completeOnboarding(token!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      queryClient.invalidateQueries({ queryKey: ["organization", "me"] });
      router.push("/coach/dashboard");
    },
  });

  // ── Steps ──

  const steps = [
    {
      title: "Set Up Your Program",
      description: "Tell us about your sport program.",
    },
    {
      title: "Recruiting Requirements",
      description: "Set the baseline criteria for your recruits.",
    },
    {
      title: "You're All Set",
      description: "Your program is ready to go.",
    },
  ];

  const canAdvanceStep0 = form.sport_code && form.division;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome{orgName ? `, ${orgName}` : ""}
        </h1>
        <p className="text-muted-foreground mt-2">
          Let&apos;s set up your recruiting program in a few quick steps.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                i < step
                  ? "bg-primary text-primary-foreground"
                  : i === step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-12 ${i < step ? "bg-primary" : "bg-muted"}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[step].title}</CardTitle>
          <p className="text-muted-foreground text-sm">{steps[step].description}</p>
        </CardHeader>
        <CardContent>
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Sport <span className="text-destructive">*</span>
                </label>
                <Select value={form.sport_code} onValueChange={(v) => set("sport_code", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPORTS.map((sport) => (
                      <SelectItem key={sport.value} value={sport.value}>
                        {sport.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Division <span className="text-destructive">*</span>
                </label>
                <Select value={form.division} onValueChange={(v) => set("division", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select division" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIVISIONS.map((div) => (
                      <SelectItem key={div.value} value={div.value}>
                        {div.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Conference</label>
                <Input
                  value={form.conference}
                  onChange={(e) => set("conference", e.target.value)}
                  placeholder="e.g. Ivy League, Big Ten"
                />
              </div>

              <Button
                className="w-full"
                onClick={() => createProgramMutation.mutate()}
                disabled={!canAdvanceStep0 || createProgramMutation.isPending}
              >
                {createProgramMutation.isPending ? "Creating..." : "Continue"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Minimum GPA</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={form.minimum_gpa}
                    onChange={(e) => set("minimum_gpa", e.target.value)}
                    placeholder="e.g. 3.0"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Roster Spots</label>
                  <Input
                    type="number"
                    min="1"
                    value={form.roster_spots}
                    onChange={(e) => set("roster_spots", e.target.value)}
                    placeholder="e.g. 8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Minimum SAT</label>
                  <Input
                    type="number"
                    min="400"
                    max="1600"
                    value={form.minimum_sat}
                    onChange={(e) => set("minimum_sat", e.target.value)}
                    placeholder="e.g. 1200"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Minimum ACT</label>
                  <Input
                    type="number"
                    min="1"
                    max="36"
                    value={form.minimum_act}
                    onChange={(e) => set("minimum_act", e.target.value)}
                    placeholder="e.g. 25"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Minimum Height (inches)</label>
                <Input
                  type="number"
                  min="48"
                  max="96"
                  value={form.minimum_height_inches}
                  onChange={(e) => set("minimum_height_inches", e.target.value)}
                  placeholder="e.g. 72 (6 feet)"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Graduation Years of Interest
                </label>
                <div className="flex flex-wrap gap-2">
                  {GRAD_YEARS.map((year) => {
                    const selected = form.graduation_years_of_interest.includes(year);
                    return (
                      <Badge
                        key={year}
                        variant={selected ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() =>
                          set(
                            "graduation_years_of_interest",
                            selected
                              ? form.graduation_years_of_interest.filter((y) => y !== year)
                              : [...form.graduation_years_of_interest, year]
                          )
                        }
                      >
                        {year}
                        {selected && <X className="ml-1 h-3 w-3" />}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Geographic Preferences</label>
                <Input
                  value={form.geographic_preferences}
                  onChange={(e) => set("geographic_preferences", e.target.value)}
                  placeholder="e.g. MA, CT, NY (comma-separated)"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Citizenship Requirements</label>
                <Select
                  value={form.citizenship_requirements}
                  onValueChange={(v) => set("citizenship_requirements", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No requirement" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIZENSHIP_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(0)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => updateRequirementsMutation.mutate()}
                  disabled={updateRequirementsMutation.isPending}
                >
                  {updateRequirementsMutation.isPending ? "Saving..." : "Continue"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 text-center">
              <div className="bg-primary/10 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                <Check className="text-primary h-8 w-8" />
              </div>
              <div>
                <p className="text-lg font-medium">Your program is set up!</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Start adding athletes to your recruiting board.
                </p>
              </div>
              {createdProgram && (
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge>
                    {SPORTS.find((s) => s.value === createdProgram.sport_code)?.label ??
                      createdProgram.sport_code}
                  </Badge>
                  <Badge variant="outline">
                    {DIVISIONS.find((d) => d.value === createdProgram.division)?.label ??
                      createdProgram.division}
                  </Badge>
                  {form.conference && <Badge variant="secondary">{form.conference}</Badge>}
                </div>
              )}
              <Button
                size="lg"
                className="w-full"
                onClick={() => completeOnboardingMutation.mutate()}
                disabled={completeOnboardingMutation.isPending}
              >
                {completeOnboardingMutation.isPending ? "Finishing..." : "Go to Dashboard"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
