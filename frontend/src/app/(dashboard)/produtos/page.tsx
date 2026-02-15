"use client";

import { ProductFormDialog, type ProductFormValues } from "@/components/products/product-form-dialog";
import { ProductSearch } from "@/components/products/product-search";
import { ProductTable } from "@/components/products/product-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCategories } from "@/hooks/use-categories";
import {
  useCreateProduct,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
} from "@/hooks/use-products";
import { reaisToCentavos } from "@/lib/format";
import type { Product } from "@/types/product";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const PAGE_SIZE = 10;
const QUERY_LIMIT = PAGE_SIZE + 1;
const SEARCH_DEBOUNCE_MS = 300;

export default function ProdutosPage() {
  const [offset, setOffset] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearchInput, setDebouncedSearchInput] = useState("");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const searchDebounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const categoriesQuery = useCategories();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  const normalizedSearch = debouncedSearchInput.trim();
  const nameFilter = normalizedSearch.length >= 2 ? normalizedSearch : undefined;

  const productsQueryParams = useMemo(
    () => ({
      offset,
      limit: QUERY_LIMIT,
      name: nameFilter,
    }),
    [offset, nameFilter]
  );

  const productsQuery = useProducts(productsQueryParams);

  const categories = categoriesQuery.data ?? [];
  const productsWithLookahead = productsQuery.data ?? [];
  const products = productsWithLookahead.slice(0, PAGE_SIZE);
  const hasMore = productsWithLookahead.length > PAGE_SIZE;
  const isFormSubmitting =
    createProductMutation.isPending || updateProductMutation.isPending;
  const isDeleteSubmitting = deleteProductMutation.isPending;

  const isSubmitDisabled =
    isFormSubmitting ||
    categoriesQuery.isLoading ||
    categoriesQuery.isError ||
    categories.length === 0;

  useEffect(
    () => () => {
      if (searchDebounceTimeoutRef.current) {
        clearTimeout(searchDebounceTimeoutRef.current);
      }
    },
    []
  );

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setOffset(0);

    if (searchDebounceTimeoutRef.current) {
      clearTimeout(searchDebounceTimeoutRef.current);
    }

    searchDebounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchInput(value.trim());
    }, SEARCH_DEBOUNCE_MS);
  };

  const handleFormDialogOpenChange = (open: boolean) => {
    setIsFormDialogOpen(open);

    if (!open) {
      setEditingProduct(null);
    }
  };

  const handleCreateClick = () => {
    setEditingProduct(null);
    setIsFormDialogOpen(true);
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsFormDialogOpen(true);
  };

  const handleSubmit = async (values: ProductFormValues) => {
    const payload = {
      name: values.name,
      categoryId: values.categoryId,
      unitPrice: reaisToCentavos(values.unitPriceReais),
      unitType: values.unitType,
      quantity: values.quantity,
      minimumQuantity: values.minimumQuantity,
      maximumQuantity: values.maximumQuantity,
    };

    try {
      if (editingProduct) {
        await updateProductMutation.mutateAsync({
          id: editingProduct.id,
          data: payload,
        });
      } else {
        await createProductMutation.mutateAsync(payload);
      }

      handleFormDialogOpenChange(false);
    } catch {
      // Errors are handled by mutation hooks with toast feedback.
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) {
      return;
    }

    try {
      await deleteProductMutation.mutateAsync(productToDelete.id);
      setProductToDelete(null);
    } catch {
      // Keep dialog open and show error toast from hook.
    }
  };

  return (
    <main className="space-y-6">
      <PageHeader
        title="Produtos"
        description="Gerencie produtos, estoque e regras de quantidade."
        action={
          <Button onClick={handleCreateClick}>
            <Plus className="size-4" />
            Novo produto
          </Button>
        }
      />

      <Card>
        <CardHeader className="space-y-4">
          <div className="space-y-1">
            <CardTitle>Lista de produtos</CardTitle>
            <CardDescription>
              Visualize, busque e gerencie todos os seus produtos.
            </CardDescription>
          </div>
          <ProductSearch value={searchInput} onChange={handleSearchChange} />
        </CardHeader>

        <CardContent>
          <ProductTable
            products={products}
            isLoading={productsQuery.isLoading}
            isFetching={productsQuery.isFetching}
            isError={productsQuery.isError}
            error={productsQuery.error}
            normalizedSearch={normalizedSearch}
            offset={offset}
            pageSize={PAGE_SIZE}
            hasMore={hasMore}
            onRetry={() => {
              void productsQuery.refetch();
            }}
            onOffsetChange={setOffset}
            onEdit={handleEditClick}
            onDelete={setProductToDelete}
          />
        </CardContent>
      </Card>

      <ProductFormDialog
        open={isFormDialogOpen}
        onOpenChange={handleFormDialogOpenChange}
        editingProduct={editingProduct}
        categories={categories}
        categoriesLoading={categoriesQuery.isLoading}
        categoriesError={categoriesQuery.error}
        isSubmitting={isFormSubmitting}
        isSubmitDisabled={isSubmitDisabled}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(productToDelete)}
        onOpenChange={(open) => {
          if (!open && !isDeleteSubmitting) {
            setProductToDelete(null);
          }
        }}
        title="Excluir produto"
        description={
          productToDelete
            ? `Deseja excluir o produto "${productToDelete.name}"?`
            : "Deseja excluir este produto?"
        }
        confirmLabel="Excluir"
        isConfirming={isDeleteSubmitting}
        onConfirm={handleDeleteConfirm}
      />
    </main>
  );
}
