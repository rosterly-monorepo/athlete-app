"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import type { ControllerRenderProps } from "react-hook-form";
import type { FormSchemaProperty } from "@/types/form-schema";
import { FieldLabel } from "../FieldLabel";

interface APScoresWidgetProps {
  field: ControllerRenderProps;
  property: FormSchemaProperty;
  fieldKey: string;
  error?: string;
  required?: boolean;
}

interface APScoreEntry {
  subject: string;
  score: number;
}

const AP_SUBJECTS = [
  "Art History",
  "Biology",
  "Calculus AB",
  "Calculus BC",
  "Chemistry",
  "Chinese Language and Culture",
  "Computer Science A",
  "Computer Science Principles",
  "English Language and Composition",
  "English Literature and Composition",
  "Environmental Science",
  "European History",
  "French Language and Culture",
  "German Language and Culture",
  "Government and Politics (Comparative)",
  "Government and Politics (US)",
  "Human Geography",
  "Italian Language and Culture",
  "Japanese Language and Culture",
  "Latin",
  "Macroeconomics",
  "Microeconomics",
  "Music Theory",
  "Physics 1",
  "Physics 2",
  "Physics C: Electricity and Magnetism",
  "Physics C: Mechanics",
  "Precalculus",
  "Psychology",
  "Research",
  "Seminar",
  "Spanish Language and Culture",
  "Spanish Literature and Culture",
  "Statistics",
  "Studio Art: 2-D Design",
  "Studio Art: 3-D Design",
  "Studio Art: Drawing",
  "US History",
  "World History: Modern",
];

const SCORE_OPTIONS = [
  { value: "5", label: "5" },
  { value: "4", label: "4" },
  { value: "3", label: "3" },
  { value: "2", label: "2" },
  { value: "1", label: "1" },
];

export function APScoresWidget({
  field,
  property,
  fieldKey,
  error,
  required,
}: APScoresWidgetProps) {
  const entries: APScoreEntry[] = Array.isArray(field.value) ? field.value : [];

  const usedSubjects = new Set(entries.map((e) => e.subject));

  const updateEntry = (index: number, updates: Partial<APScoreEntry>) => {
    const next = entries.map((entry, i) => (i === index ? { ...entry, ...updates } : entry));
    field.onChange(next);
  };

  const addEntry = () => {
    field.onChange([...entries, { subject: "", score: 0 }]);
  };

  const removeEntry = (index: number) => {
    field.onChange(entries.filter((_, i) => i !== index));
  };

  return (
    <div className="grid gap-3">
      <FieldLabel fieldKey={fieldKey} property={property} required={required} />

      {entries.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <Select
            value={entry.subject}
            onValueChange={(value) => updateEntry(index, { subject: value })}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select subject..." />
            </SelectTrigger>
            <SelectContent>
              {AP_SUBJECTS.filter((s) => s === entry.subject || !usedSubjects.has(s)).map(
                (subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>

          <Select
            value={entry.score ? String(entry.score) : ""}
            onValueChange={(value) => updateEntry(index, { score: parseInt(value, 10) })}
          >
            <SelectTrigger className="w-20">
              <SelectValue placeholder="Score" />
            </SelectTrigger>
            <SelectContent>
              {SCORE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive h-9 w-9 shrink-0"
            onClick={() => removeEntry(index)}
            aria-label="Remove AP score"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={addEntry}
        disabled={entries.length >= AP_SUBJECTS.length}
      >
        <Plus className="mr-1 h-4 w-4" />
        Add AP Score
      </Button>

      {property.description && (
        <p className="text-muted-foreground text-xs">{property.description}</p>
      )}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
