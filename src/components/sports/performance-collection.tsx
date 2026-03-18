"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { DynamicForm } from "@/components/dynamic-forms";
import { formatDistance } from "@/lib/format";
import {
  usePerformanceSchema,
  usePerformances,
  useCreatePerformance,
  useUpdatePerformance,
  useDeletePerformance,
} from "@/hooks/use-sports";
import type { RowingPerformanceView } from "@/services/types";

const ERG_BEST_LABELS: Record<string, string> = {
  erg_2000m: "Best 2K",
  erg_5000m: "Best 5K",
  erg_6000m: "Best 6K",
  erg_500m: "Best 500m",
};

interface PerformanceCollectionProps {
  sportId: number;
  sportCode: string;
}

export function PerformanceCollection({ sportId, sportCode }: PerformanceCollectionProps) {
  const { data: schema, isLoading: schemaLoading } = usePerformanceSchema(sportCode);
  const { data: performances, isLoading: perfLoading } = usePerformances(sportId);
  const createMutation = useCreatePerformance(sportId);
  const updateMutation = useUpdatePerformance(sportId);
  const deleteMutation = useDeletePerformance(sportId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RowingPerformanceView | null>(null);

  const handleAdd = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: RowingPerformanceView) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = (item: RowingPerformanceView) => {
    deleteMutation.mutate(item.id);
  };

  const handleSubmit = (data: Record<string, unknown>) => {
    if (editingItem) {
      updateMutation.mutate(
        { perfId: editingItem.id, data },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => setDialogOpen(false),
      });
    }
  };

  if (schemaLoading || perfLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Performances</CardTitle>
          <Button size="sm" onClick={handleAdd} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Performance
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {performances && performances.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b text-left">
                  <th className="pr-4 pb-2 font-medium">Date</th>
                  <th className="pr-4 pb-2 font-medium">Event</th>
                  <th className="pr-4 pb-2 font-medium">Distance</th>
                  <th className="pr-4 pb-2 font-medium">Time</th>
                  <th className="pr-4 pb-2 font-medium">Split</th>
                  <th className="pr-4 pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {performances.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2 pr-4 whitespace-nowrap">
                      {new Date(p.event_date).toLocaleDateString()}
                    </td>
                    <td className="py-2 pr-4">
                      <div>{p.event_name}</div>
                    </td>
                    <td className="py-2 pr-4 font-mono">
                      {p.distance_meters != null ? formatDistance(p.distance_meters) : "\u2014"}
                    </td>
                    <td className="py-2 pr-4 font-mono">{p.result_display}</td>
                    <td className="text-muted-foreground py-2 pr-4 font-mono">
                      {p.split_display ?? "\u2014"}
                    </td>
                    <td className="py-2 pr-4">
                      <PerformanceTags performance={p} />
                    </td>
                    <td className="py-2">
                      {p.source === "manual" && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleEdit(p)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive h-7 w-7"
                            onClick={() => handleDelete(p)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground py-4 text-center text-sm">
            No performances added yet. Click &quot;Add Performance&quot; to get started.
          </p>
        )}
      </CardContent>

      {schema && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Performance" : "Add Performance"}</DialogTitle>
            </DialogHeader>
            <DynamicForm
              schema={schema}
              initialData={
                editingItem
                  ? {
                      event: editingItem.event,
                      result_seconds: editingItem.result_seconds,
                      event_name: editingItem.event_name,
                      event_date: editingItem.event_date,
                      event_location: editingItem.event_location,
                      event_type: editingItem.event_type,
                      stroke_rate_avg: editingItem.stroke_rate_avg,
                      heart_rate_avg: editingItem.heart_rate_avg,
                      drag_factor: editingItem.drag_factor,
                      place: editingItem.place,
                      margin_seconds: editingItem.margin_seconds,
                      seat_position: editingItem.seat_position,
                      is_coxswain: editingItem.is_coxswain,
                      water_conditions: editingItem.water_conditions,
                      regatta_central_url: editingItem.regatta_central_url,
                    }
                  : undefined
              }
              onSubmit={handleSubmit}
              isSubmitting={createMutation.isPending || updateMutation.isPending}
              submitLabel={editingItem ? "Save Changes" : "Add Performance"}
              compact
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}

function PerformanceTags({ performance: p }: { performance: RowingPerformanceView }) {
  return (
    <div className="flex flex-wrap gap-1">
      {p.is_erg_record && ERG_BEST_LABELS[p.event] && (
        <Badge variant="default" className="px-1.5 py-0 text-[10px]">
          {ERG_BEST_LABELS[p.event]}
        </Badge>
      )}
      {p.is_personal_record && !p.is_erg_record && (
        <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
          PR
        </Badge>
      )}
      <Badge variant="outline" className="text-xs capitalize">
        {p.event_category}
      </Badge>
      {p.source === "concept2" && (
        <Badge variant="secondary" className="px-1 text-[10px]">
          C2
        </Badge>
      )}
    </div>
  );
}
