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
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import {
  createProgram,
  updateProgram,
  completeOnboarding,
  type CreateProgramInput,
} from "@/services/organization";
import type { OrganizationProgram, ProgramRequirements } from "@/services/types";
import { useUserRole } from "@/hooks/use-user-role";
import { RequirementsEditor } from "./requirements-editor";

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

interface ProgramForm {
  sport_code: string;
  division: string;
  conference: string;
}

const INITIAL_PROGRAM_FORM: ProgramForm = {
  sport_code: "",
  division: "",
  conference: "",
};

export function OnboardingWizard() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { orgName } = useUserRole();
  const queryClient = useQueryClient();
  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState<ProgramForm>(INITIAL_PROGRAM_FORM);
  const [createdProgram, setCreatedProgram] = React.useState<OrganizationProgram | null>(null);

  const set = (field: keyof ProgramForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

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
      queryClient.invalidateQueries({ queryKey: ["programs"] });
      setStep(1);
    },
  });

  const updateRequirementsMutation = useMutation({
    mutationFn: async (requirements: ProgramRequirements) => {
      const token = await getToken();
      if (!createdProgram) throw new Error("No program created");
      return updateProgram(token!, createdProgram.id, { requirements });
    },
    onSuccess: (program) => {
      setCreatedProgram(program);
      queryClient.invalidateQueries({ queryKey: ["programs"] });
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

  const steps = [
    { title: "Set Up Your Program", description: "Tell us about your sport program." },
    { title: "Recruiting Minimums", description: "Set the thresholds you recruit against." },
    { title: "You're All Set", description: "Your program is ready to go." },
  ];

  const canAdvanceStep0 = form.sport_code && form.division;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome{orgName ? `, ${orgName}` : ""}
        </h1>
        <p className="text-muted-foreground mt-2">
          Let&apos;s set up your recruiting program in a few quick steps.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
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

          {step === 1 && createdProgram && (
            <div className="space-y-4">
              <RequirementsEditor
                program={createdProgram}
                isEditable={true}
                isSaving={updateRequirementsMutation.isPending}
                onSave={(req) => updateRequirementsMutation.mutate(req)}
              />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(0)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setStep(2)}
                  disabled={updateRequirementsMutation.isPending}
                >
                  Skip for now
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
