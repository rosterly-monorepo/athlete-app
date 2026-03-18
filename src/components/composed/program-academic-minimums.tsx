"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { OrganizationProgram } from "@/services/types";
import type { CreateProgramInput } from "@/services/organization";

interface ProgramAcademicMinimumsProps {
  program: OrganizationProgram;
  isEditable: boolean;
  onSave: (data: Partial<CreateProgramInput>) => void;
  isSaving: boolean;
}

/**
 * Card for editing academic minimums (GPA, SAT, ACT) on a program.
 *
 * To reset local form state when the program data changes externally,
 * pass a `key` prop from the parent that changes on save (e.g. `program.updated_at`).
 */
export function ProgramAcademicMinimums({
  program,
  isEditable,
  onSave,
  isSaving,
}: ProgramAcademicMinimumsProps) {
  const [gpa, setGpa] = useState(program.minimum_gpa?.toString() ?? "");
  const [sat, setSat] = useState(program.minimum_sat?.toString() ?? "");
  const [act, setAct] = useState(program.minimum_act?.toString() ?? "");

  const handleSave = () => {
    onSave({
      minimum_gpa: gpa ? parseFloat(gpa) : undefined,
      minimum_sat: sat ? parseInt(sat, 10) : undefined,
      minimum_act: act ? parseInt(act, 10) : undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Academic Minimums</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor={`gpa-${program.id}`}>Minimum GPA</Label>
            <Input
              id={`gpa-${program.id}`}
              type="number"
              step="0.1"
              min="0"
              max="5.0"
              placeholder="e.g. 3.0"
              value={gpa}
              onChange={(e) => setGpa(e.target.value)}
              disabled={!isEditable || isSaving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`sat-${program.id}`}>Minimum SAT</Label>
            <Input
              id={`sat-${program.id}`}
              type="number"
              step="10"
              min="400"
              max="1600"
              placeholder="e.g. 1200"
              value={sat}
              onChange={(e) => setSat(e.target.value)}
              disabled={!isEditable || isSaving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`act-${program.id}`}>Minimum ACT</Label>
            <Input
              id={`act-${program.id}`}
              type="number"
              step="1"
              min="1"
              max="36"
              placeholder="e.g. 25"
              value={act}
              onChange={(e) => setAct(e.target.value)}
              disabled={!isEditable || isSaving}
            />
          </div>
        </div>

        {isEditable && (
          <div className="mt-4">
            <Button onClick={handleSave} disabled={isSaving} size="sm">
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
