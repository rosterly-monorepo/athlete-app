"use client";

import { useState } from "react";
import { Plus, Trash2, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useReferenceCoaches,
  useAddReferenceCoach,
  useDeleteReferenceCoach,
} from "@/hooks/use-sports";
import type { ReferenceCoachInput } from "@/services/types";

interface ReferenceCoachesSectionProps {
  sportId: number;
}

export function ReferenceCoachesSection({ sportId }: ReferenceCoachesSectionProps) {
  const { data: coaches, isLoading } = useReferenceCoaches(sportId);
  const deleteMutation = useDeleteReferenceCoach(sportId);

  const handleDelete = (coachId: number) => {
    if (confirm("Remove this reference coach?")) {
      deleteMutation.mutate(coachId);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-medium">Reference Coaches</CardTitle>
        <AddReferenceCoachDialog sportId={sportId} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : !coaches || coaches.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No reference coaches added yet. Add a coach who college recruiters can contact.
          </p>
        ) : (
          <div className="space-y-3">
            {coaches.map((coach) => (
              <div
                key={coach.id}
                className="flex items-start justify-between rounded-md border p-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {coach.first_name} {coach.last_name}
                  </p>
                  <div className="text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    {coach.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {coach.email}
                      </span>
                    )}
                    {coach.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {coach.phone}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive h-8 w-8 shrink-0"
                  onClick={() => handleDelete(coach.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AddReferenceCoachDialog({ sportId }: { sportId: number }) {
  const [open, setOpen] = useState(false);
  const addMutation = useAddReferenceCoach(sportId);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: ReferenceCoachInput = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
    };
    addMutation.mutate(data, { onSuccess: () => setOpen(false) });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Reference Coach</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input id="first_name" name="first_name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input id="last_name" name="last_name" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" type="tel" />
          </div>
          <Button type="submit" disabled={addMutation.isPending}>
            {addMutation.isPending ? "Adding..." : "Add Coach"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
