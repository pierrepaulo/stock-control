"use client";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import {
  useCategoriesWithProductCount,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/hooks/use-categories";
import { formatDate } from "@/lib/format";
import type { CategoryWithCount } from "@/types/category";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { FolderTree, Pencil, Plus, RefreshCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const PAGE_SIZE = 10;

const categoryFormSchema = z.object({
  name: z.string().trim().min(2, "Nome precisa ter ao menos 2 caracteres."),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

const defaultCategoryValues: CategoryFormValues = {
  name: "",
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export default function CategoriasPage() {
  const categoriesQuery = useCategoriesWithProductCount();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const [offset, setOffset] = useState(0);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(
    null
  );
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryWithCount | null>(
    null
  );

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: defaultCategoryValues,
  });

  const isFormSubmitting =
    createCategoryMutation.isPending || updateCategoryMutation.isPending;
  const isDeleteSubmitting = deleteCategoryMutation.isPending;

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

  const handleFormDialogOpenChange = (open: boolean) => {
    setIsFormDialogOpen(open);

    if (!open) {
      setEditingCategory(null);
      form.reset(defaultCategoryValues);
    }
  };

  const handleCreateClick = () => {
    setEditingCategory(null);
    form.reset(defaultCategoryValues);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (category: CategoryWithCount) => {
    setEditingCategory(category);
    form.reset({ name: category.name });
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

  const columns: DataTableColumn<CategoryWithCount>[] = [
    {
      id: "name",
      header: "Nome",
      cell: (category) => <span className="font-medium">{category.name}</span>,
      skeleton: <Skeleton className="h-4 w-40" />,
    },
    {
      id: "productCount",
      header: "Produtos",
      cell: (category) => category.productCount,
      skeleton: <Skeleton className="h-4 w-10" />,
    },
    {
      id: "createdAt",
      header: "Criado em",
      cell: (category) => formatDate(category.createdAt),
      skeleton: <Skeleton className="h-4 w-24" />,
    },
    {
      id: "actions",
      header: "Acoes",
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (category) => (
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => handleEditClick(category)}
            aria-label={`Editar categoria ${category.name}`}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            onClick={() => setCategoryToDelete(category)}
            aria-label={`Excluir categoria ${category.name}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
      skeleton: (
        <div className="flex justify-end gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      ),
    },
  ];

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
            Exibindo categorias com contagem de produtos (`includeProductCount=true`).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categoriesQuery.isError ? (
            <EmptyState
              tone="danger"
              title="Nao foi possivel carregar as categorias."
              description={getErrorMessage(
                categoriesQuery.error,
                "Erro inesperado ao consultar categorias."
              )}
              icon={<RefreshCcw className="size-5" />}
              action={
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    void categoriesQuery.refetch();
                  }}
                >
                  <RefreshCcw className="size-4" />
                  Tentar novamente
                </Button>
              }
            />
          ) : (
            <>
              <DataTable
                columns={columns}
                data={currentPageCategories}
                getRowId={(category) => category.id}
                isLoading={categoriesQuery.isLoading}
                loadingRowCount={5}
                emptyState={
                  <EmptyState
                    title="Nenhuma categoria cadastrada."
                    description="Crie a primeira categoria para organizar os produtos."
                    icon={<FolderTree className="size-5" />}
                  />
                }
              />

              {!categoriesQuery.isLoading && categories.length > 0 ? (
                <div className="mt-4">
                  <DataTablePagination
                    offset={safeOffset}
                    limit={PAGE_SIZE}
                    hasMore={hasMore}
                    onOffsetChange={(nextOffset) =>
                      setOffset(Math.min(nextOffset, maxOffset))
                    }
                  />
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormDialogOpen} onOpenChange={handleFormDialogOpenChange}>
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
            onSubmit={form.handleSubmit((values) => void handleSubmit(values))}
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
                onClick={() => handleFormDialogOpenChange(false)}
                disabled={isFormSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isFormSubmitting}>
                {isFormSubmitting
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
