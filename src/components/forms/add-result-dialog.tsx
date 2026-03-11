"use client";

import { useState } from "react";
import { useAddResult } from "@/hooks/use-performance";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import type { AddResultInput } from "@/services/types";

const RESULT_UNITS = [
  { value: "seconds", label: "Seconds" },
  { value: "minutes", label: "Minutes" },
  { value: "meters", label: "Meters" },
  { value: "feet", label: "Feet" },
  { value: "points", label: "Points" },
  { value: "lbs", label: "Pounds" },
  { value: "kg", label: "Kilograms" },
  { value: "place", label: "Place (1st, 2nd...)" },
] as const;

export function AddResultDialog() {
  const [open, setOpen] = useState(false);
  const addResult = useAddResult();

  const [form, setForm] = useState<AddResultInput>({
    date: new Date().toISOString().split("T")[0],
    competitionName: "",
    event: "",
    result: "",
    unit: "seconds",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addResult.mutate(form, {
      onSuccess: () => {
        setOpen(false);
        setForm({
          date: new Date().toISOString().split("T")[0],
          competitionName: "",
          event: "",
          result: "",
          unit: "seconds",
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Result
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Competition Result</DialogTitle>
            <DialogDescription>
              Enter the details of your competition result. This will appear on your public profile.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="competitionName">Competition Name</Label>
              <Input
                id="competitionName"
                name="competitionName"
                value={form.competitionName}
                onChange={handleChange}
                placeholder="e.g. State Championships 2024"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="event">Event</Label>
              <Input
                id="event"
                name="event"
                value={form.event}
                onChange={handleChange}
                placeholder="e.g. 100m Sprint, Long Jump"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="result">Result</Label>
                <Input
                  id="result"
                  name="result"
                  value={form.result}
                  onChange={handleChange}
                  placeholder="e.g. 10.5"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Select
                  value={form.unit}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, unit: value }))}
                >
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {RESULT_UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addResult.isPending}>
              {addResult.isPending ? "Adding..." : "Add Result"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
