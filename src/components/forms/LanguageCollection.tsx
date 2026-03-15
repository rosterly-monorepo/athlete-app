"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DynamicForm } from "@/components/dynamic-forms";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useLanguages,
  useCreateLanguage,
  useUpdateLanguage,
  useDeleteLanguage,
} from "@/hooks/use-languages";
import type { LanguageEntry } from "@/services/languages";
import type { FormSchema } from "@/types/form-schema";

interface LanguageCollectionProps {
  schema: FormSchema;
}

export function LanguageCollection({ schema }: LanguageCollectionProps) {
  const { data: languages, isLoading } = useLanguages();
  const createMutation = useCreateLanguage();
  const updateMutation = useUpdateLanguage();
  const deleteMutation = useDeleteLanguage();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LanguageEntry | null>(null);

  const handleAdd = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: LanguageEntry) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = (item: LanguageEntry) => {
    deleteMutation.mutate(item.id);
  };

  const handleSubmit = (data: Record<string, unknown>) => {
    if (editingItem) {
      updateMutation.mutate(
        { id: editingItem.id, data: data as { language?: string; proficiency?: string } },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createMutation.mutate(data as { language: string; proficiency: string }, {
        onSuccess: () => setDialogOpen(false),
      });
    }
  };

  // Resolve option labels for display
  const languageOptions = schema.properties?.language?.["x-ui-options"];
  const proficiencyOptions = schema.properties?.proficiency?.["x-ui-options"];

  const getLabel = (options: typeof languageOptions, value: string) =>
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
          <h2 className="text-lg font-semibold">{schema.title || "Languages"}</h2>
          <p className="text-muted-foreground text-sm">Add languages you speak.</p>
        </div>
        <Button size="sm" onClick={handleAdd} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Language
        </Button>
      </div>

      {languages && languages.length > 0 ? (
        <div className="space-y-2">
          {languages.map((lang) => (
            <Card key={lang.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{getLabel(languageOptions, lang.language)}</p>
                  <p className="text-muted-foreground text-sm">
                    {getLabel(proficiencyOptions, lang.proficiency)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(lang)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive h-8 w-8"
                    onClick={() => handleDelete(lang)}
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
            No languages added yet. Click &quot;Add Language&quot; to get started.
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Language" : "Add Language"}</DialogTitle>
          </DialogHeader>
          <DynamicForm
            schema={schema}
            initialData={
              editingItem
                ? { language: editingItem.language, proficiency: editingItem.proficiency }
                : undefined
            }
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
            submitLabel={editingItem ? "Save Changes" : "Add Language"}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
