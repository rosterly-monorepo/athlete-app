"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DynamicForm } from "@/components/dynamic-forms";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useActivities,
  useCreateActivity,
  useUpdateActivity,
  useDeleteActivity,
} from "@/hooks/use-activities";
import type { ActivityEntry } from "@/services/activities";
import type { FormSchema } from "@/types/form-schema";

interface ActivityCollectionProps {
  schema: FormSchema;
}

export function ActivityCollection({ schema }: ActivityCollectionProps) {
  const { data: activities, isLoading } = useActivities();
  const createMutation = useCreateActivity();
  const updateMutation = useUpdateActivity();
  const deleteMutation = useDeleteActivity();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ActivityEntry | null>(null);

  const handleAdd = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: ActivityEntry) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = (item: ActivityEntry) => {
    deleteMutation.mutate(item.id);
  };

  const handleSubmit = (data: Record<string, unknown>) => {
    if (editingItem) {
      updateMutation.mutate(
        { id: editingItem.id, data: data as Record<string, unknown> },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createMutation.mutate(data as { activity_type: string; name: string }, {
        onSuccess: () => setDialogOpen(false),
      });
    }
  };

  // Resolve option labels for display
  const activityTypeOptions = schema.properties?.activity_type?.["x-ui-options"];

  const getLabel = (options: typeof activityTypeOptions, value: string) =>
    options?.find((o) => o.value === value)?.label || value;

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{schema.title || "Activities"}</h2>
          <p className="text-muted-foreground text-sm">
            Add your extracurricular activities, honors, and awards.
          </p>
        </div>
        <Button size="sm" onClick={handleAdd} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Activity
        </Button>
      </div>

      {activities && activities.length > 0 ? (
        <div className="space-y-2">
          {activities.map((activity) => (
            <Card key={activity.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{activity.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {getLabel(activityTypeOptions, activity.activity_type)}
                    {activity.organization && ` \u2022 ${activity.organization}`}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(activity)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive h-8 w-8"
                    onClick={() => handleDelete(activity)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-muted-foreground py-8 text-center text-sm">
            No activities added yet. Click &quot;Add Activity&quot; to get started.
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Activity" : "Add Activity"}</DialogTitle>
          </DialogHeader>
          <DynamicForm
            schema={schema}
            initialData={
              editingItem
                ? {
                    activity_type: editingItem.activity_type,
                    name: editingItem.name,
                    organization: editingItem.organization,
                    description: editingItem.description,
                    start_date: editingItem.start_date,
                    end_date: editingItem.end_date,
                    hours_per_week: editingItem.hours_per_week,
                    weeks_per_year: editingItem.weeks_per_year,
                    position_title: editingItem.position_title,
                    recognition_level: editingItem.recognition_level,
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            submitLabel={editingItem ? "Save Changes" : "Add Activity"}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
