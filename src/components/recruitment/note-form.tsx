"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NoteType } from "@/services/types";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const NOTE_TYPES: { value: NoteType; label: string }[] = [
  { value: "general", label: "General" },
  { value: "call", label: "Phone Call" },
  { value: "email", label: "Email" },
  { value: "visit", label: "Visit" },
  { value: "evaluation", label: "Evaluation" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface NoteFormProps extends Omit<React.HTMLAttributes<HTMLFormElement>, "onSubmit"> {
  onSubmit: (content: string, noteType: NoteType) => void;
  isSubmitting?: boolean;
  defaultNoteType?: NoteType;
  placeholder?: string;
  submitLabel?: string;
  showNoteTypeSelector?: boolean;
  minRows?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const NoteForm = React.forwardRef<HTMLFormElement, NoteFormProps>(
  (
    {
      onSubmit,
      isSubmitting = false,
      defaultNoteType = "general",
      placeholder = "Add a note...",
      submitLabel,
      showNoteTypeSelector = true,
      minRows = 2,
      className,
      ...props
    },
    ref
  ) => {
    const [content, setContent] = React.useState("");
    const [noteType, setNoteType] = React.useState<NoteType>(defaultNoteType);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedContent = content.trim();
      if (!trimmedContent) return;

      onSubmit(trimmedContent, noteType);
      setContent("");
      setNoteType(defaultNoteType);
    };

    const isDisabled = !content.trim() || isSubmitting;

    return (
      <form ref={ref} onSubmit={handleSubmit} className={cn("space-y-3", className)} {...props}>
        {showNoteTypeSelector && (
          <div className="flex gap-2">
            <Select value={noteType} onValueChange={(value) => setNoteType(value as NoteType)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NOTE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex gap-2">
          <Textarea
            placeholder={placeholder}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={minRows}
            className="min-h-[60px] flex-1 resize-none"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isDisabled}
            aria-label={submitLabel ?? "Submit note"}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    );
  }
);
NoteForm.displayName = "NoteForm";

export { NoteForm, NOTE_TYPES };
