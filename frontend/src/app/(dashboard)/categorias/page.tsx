"use client";

import {
  useCategoriesWithProductCount,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/hooks/use-categories";
import { formatDate } from "@/lib/format";
import type { CategoryWithCount } from "@/types/category";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, RefreshCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const categoryFormSchema = z.object({
  name: z.string().trim().min(2, "Nome precisa ter ao menos 2 caracteres."),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

const defaultCategoryValues: CategoryFormValues = {
  name: "",
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

function CategoriesTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Produtos</TableHead>
          <TableHead>Criado em</TableHead>
          <TableHead className="text-right">Acoes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <Skeleton className="h-4 w-40" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-10" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function CategoriasPage() {
  const categoriesQuery = useCategoriesWithProductCount();
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

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

  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground text-sm">
            Crie, edite e organize as categorias dos produtos.
          </p>
        </div>

        <Button onClick={handleCreateClick}>
          <Plus className="size-4" />
          Nova categoria
        </Button>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Lista de categorias</CardTitle>
          <CardDescription>
            Exibindo categorias com contagem de produtos (`includeProductCount=true`).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categoriesQuery.isLoading ? (
            <CategoriesTableSkeleton />
          ) : categoriesQuery.isError ? (
            <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-700">
                Nao foi possivel carregar as categorias.
              </p>
              <p className="text-sm text-red-700">
                {getErrorMessage(
                  categoriesQuery.error,
                  "Erro inesperado ao consultar categorias."
                )}
              </p>
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
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Produtos</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-muted-foreground h-24 text-center">
                      Nenhuma categoria cadastrada ainda.
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{category.productCount}</TableCell>
                      <TableCell>{formatDate(category.createdAt)}</TableCell>
                      <TableCell className="text-right">
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
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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

      <AlertDialog
        open={Boolean(categoryToDelete)}
        onOpenChange={(open) => {
          if (!open && !isDeleteSubmitting) {
            setCategoryToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria</AlertDialogTitle>
            <AlertDialogDescription>
              {categoryToDelete
                ? `Deseja excluir a categoria "${categoryToDelete.name}"?`
                : "Deseja excluir esta categoria?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleteSubmitting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleteSubmitting}
              onClick={(event) => {
                event.preventDefault();
                void handleDeleteConfirm();
              }}
            >
              {isDeleteSubmitting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
