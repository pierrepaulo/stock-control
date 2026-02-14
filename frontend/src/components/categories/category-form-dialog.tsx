"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CategoryWithCount } from "@/types/category";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const categoryFormSchema = z.object({
  name: z.string().trim().min(2, "Nome precisa ter ao menos 2 caracteres."),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

const defaultCategoryValues: CategoryFormValues = {
  name: "",
};

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCategory: CategoryWithCount | null;
  isSubmitting: boolean;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  editingCategory,
  isSubmitting,
  onSubmit,
}: CategoryFormDialogProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: defaultCategoryValues,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    if (editingCategory) {
      form.reset({ name: editingCategory.name });
      return;
    }

    form.reset(defaultCategoryValues);
  }, [editingCategory, form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingCategory ? "Editar categoria" : "Nova categoria"}
          </DialogTitle>
          <DialogDescription>
            {editingCategory
              ? "Atualize os dados da categoria selecionada."
              : "Informe o nome da nova categoria."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => void onSubmit(values))}
        >
          <div className="space-y-2">
            <Label htmlFor="category-name">Nome</Label>
            <Input
              id="category-name"
              placeholder="Ex: Bebidas"
              autoFocus
              {...form.register("name")}
            />
            {form.formState.errors.name?.message ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.name.message}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? editingCategory
                  ? "Salvando..."
                  : "Criando..."
                : editingCategory
                  ? "Salvar alteracoes"
                  : "Criar categoria"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
