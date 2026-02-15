"use client";

import {
  CategoryFormDialog,
  type CategoryFormValues,
} from "@/components/categories/category-form-dialog";
import { CategoryTable } from "@/components/categories/category-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useCategoriesWithProductCount,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/hooks/use-categories";
import type { CategoryWithCount } from "@/types/category";
import { Plus } from "lucide-react";
import { useState } from "react";

const PAGE_SIZE = 10;

export default function CategoriasPage() {
  const categoriesQuery = useCategoriesWithProductCount();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const [offset, setOffset] = useState(0);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<CategoryWithCount | null>(null);
  const [categoryToDelete, setCategoryToDelete] =
    useState<CategoryWithCount | null>(null);

  const categories = categoriesQuery.data ?? [];
  const maxOffset =
    categories.length > 0
      ? Math.floor((categories.length - 1) / PAGE_SIZE) * PAGE_SIZE
      : 0;
  const safeOffset = Math.min(offset, maxOffset);
  const currentPageCategories = categories.slice(
    safeOffset,
    safeOffset + PAGE_SIZE
  );
  const hasMore = safeOffset + PAGE_SIZE < categories.length;

  const isFormSubmitting =
    createCategoryMutation.isPending || updateCategoryMutation.isPending;
  const isDeleteSubmitting = deleteCategoryMutation.isPending;

  const handleFormDialogOpenChange = (open: boolean) => {
    setIsFormDialogOpen(open);

    if (!open) {
      setEditingCategory(null);
    }
  };

  const handleCreateClick = () => {
    setEditingCategory(null);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (category: CategoryWithCount) => {
    setEditingCategory(category);
    setIsFormDialogOpen(true);
  };

  const handleSubmit = async (values: CategoryFormValues) => {
    try {
      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({
          id: editingCategory.id,
          data: values,
        });
      } else {
        await createCategoryMutation.mutateAsync(values);
      }

      handleFormDialogOpenChange(false);
    } catch {
      // Errors are handled by mutation hooks with toast feedback.
    }
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) {
      return;
    }

    try {
      await deleteCategoryMutation.mutateAsync(categoryToDelete.id);
      setCategoryToDelete(null);
    } catch {
      // Keep dialog open and show error toast from hook.
    }
  };

  return (
    <main className="space-y-6">
      <PageHeader
        title="Categorias"
        description="Crie, edite e organize as categorias dos produtos."
        action={
          <Button onClick={handleCreateClick}>
            <Plus className="size-4" />
            Nova categoria
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Lista de categorias</CardTitle>
          <CardDescription>
            Organize seus produtos por categorias com contagem de itens.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <CategoryTable
            categories={currentPageCategories}
            isLoading={categoriesQuery.isLoading}
            isFetching={categoriesQuery.isFetching}
            isError={categoriesQuery.isError}
            error={categoriesQuery.error}
            offset={safeOffset}
            pageSize={PAGE_SIZE}
            hasMore={hasMore}
            onRetry={() => {
              void categoriesQuery.refetch();
            }}
            onOffsetChange={(nextOffset) =>
              setOffset(Math.min(nextOffset, maxOffset))
            }
            onEdit={handleEditClick}
            onDelete={setCategoryToDelete}
          />
        </CardContent>
      </Card>

      <CategoryFormDialog
        open={isFormDialogOpen}
        onOpenChange={handleFormDialogOpenChange}
        editingCategory={editingCategory}
        isSubmitting={isFormSubmitting}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(categoryToDelete)}
        onOpenChange={(open) => {
          if (!open && !isDeleteSubmitting) {
            setCategoryToDelete(null);
          }
        }}
        title="Excluir categoria"
        description={
          categoryToDelete
            ? `Deseja excluir a categoria "${categoryToDelete.name}"?`
            : "Deseja excluir esta categoria?"
        }
        confirmLabel="Excluir"
        isConfirming={isDeleteSubmitting}
        onConfirm={handleDeleteConfirm}
      />
    </main>
  );
}
