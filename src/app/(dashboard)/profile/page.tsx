"use client";

import { useUser } from "@clerk/nextjs";
import { useMyProfile, useUpdateProfile } from "@/hooks/use-athlete";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SPORTS, GRADUATION_YEARS } from "@/lib/constants";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { UpdateProfileInput } from "@/services/types";

export default function ProfilePage() {
  const { user } = useUser();
  const { data: profile, isLoading } = useMyProfile();
  const updateProfile = useUpdateProfile();

  const [form, setForm] = useState<UpdateProfileInput>({
    sport: "",
    position: "",
    school: "",
    graduationYear: undefined,
    heightFeet: undefined,
    heightInches: undefined,
    weight: undefined,
    bio: "",
  });

  // Hydrate form when profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        sport: profile.sport || "",
        position: profile.position || "",
        school: profile.school || "",
        graduationYear: profile.graduationYear || undefined,
        heightFeet: profile.heightFeet || undefined,
        heightInches: profile.heightInches || undefined,
        weight: profile.weight || undefined,
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: e.target.type === "number" ? (value ? Number(value) : undefined) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(form);
  };

  if (isLoading) return <ProfileSkeleton />;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Athlete Profile</h1>
      <p className="text-muted-foreground mb-8">
        This information will appear on your public athlete profile page.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name — from Clerk */}
        <Card>
          <CardHeader><CardTitle className="text-base">Identity</CardTitle></CardHeader>
          <CardContent>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input type="text" value={user?.fullName || ""} disabled className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm opacity-60" />
            <p className="text-xs text-muted-foreground mt-1">Managed through your account settings.</p>
          </CardContent>
        </Card>

        {/* Sport & Position */}
        <Card>
          <CardHeader><CardTitle className="text-base">Athletics</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sport</label>
                <select name="sport" value={form.sport} onChange={handleChange} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select sport...</option>
                  {SPORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Position</label>
                <input type="text" name="position" value={form.position} onChange={handleChange} placeholder="e.g. Point Guard" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">School</label>
                <input type="text" name="school" value={form.school} onChange={handleChange} placeholder="e.g. University of Texas" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Graduation Year</label>
                <select name="graduationYear" value={form.graduationYear ?? ""} onChange={handleChange} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select year...</option>
                  {GRADUATION_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Physical */}
        <Card>
          <CardHeader><CardTitle className="text-base">Physical Stats</CardTitle></CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Height (ft)</label>
                <input type="number" name="heightFeet" value={form.heightFeet ?? ""} onChange={handleChange} min={4} max={7} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Height (in)</label>
                <input type="number" name="heightInches" value={form.heightInches ?? ""} onChange={handleChange} min={0} max={11} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Weight (lbs)</label>
                <input type="number" name="weight" value={form.weight ?? ""} onChange={handleChange} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        <Card>
          <CardHeader><CardTitle className="text-base">About You</CardTitle></CardHeader>
          <CardContent>
            <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} placeholder="Tell coaches and recruiters about yourself..." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none" />
          </CardContent>
        </Card>

        <Button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="max-w-2xl space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}
