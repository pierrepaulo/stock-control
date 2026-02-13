"use client";

import { MoveFormDialog, type MoveFormValues } from "@/components/moves/move-form-dialog";
import { MoveProductFilter } from "@/components/moves/move-product-filter";
import { MoveTable } from "@/components/moves/move-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateMove, useMoves } from "@/hooks/use-moves";
import { useProducts } from "@/hooks/use-products";
import { reaisToCentavos } from "@/lib/format";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

const PAGE_SIZE = 10;
const QUERY_LIMIT = PAGE_SIZE + 1;
const PRODUCT_OPTIONS_LIMIT = 1000;

export default function MovimentacoesPage() {
  const [offset, setOffset] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(
    undefined
  );
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);

  const productOptionsParams = useMemo(
    () => ({ offset: 0, limit: PRODUCT_OPTIONS_LIMIT }),
    []
  );

  const productsQuery = useProducts(productOptionsParams);

  const movesQueryParams = useMemo(
    () => ({
      offset,
      limit: QUERY_LIMIT,
      productId: selectedProductId,
    }),
    [offset, selectedProductId]
  );

  const movesQuery = useMoves(movesQueryParams);
  const createMoveMutation = useCreateMove();

  const products = productsQuery.data ?? [];
  const movesWithLookahead = movesQuery.data ?? [];
  const moves = movesWithLookahead.slice(0, PAGE_SIZE);
  const hasMore = movesWithLookahead.length > PAGE_SIZE;
  const isFiltered = Boolean(selectedProductId);
  const canCreateMove =
    !productsQuery.isLoading &&
    !productsQuery.isError &&
    products.length > 0;

  const handleFilterChange = (productId?: string) => {
    setSelectedProductId(productId);
    setOffset(0);
  };

  const handleSubmit = async (values: MoveFormValues) => {
    const payload = {
      productId: values.productId,
      type: values.type,
      quantity: values.quantity,
      unitPrice:
        values.unitPriceReais !== undefined
          ? reaisToCentavos(values.unitPriceReais)
          : undefined,
    };

    try {
      await createMoveMutation.mutateAsync(payload);
      setIsFormDialogOpen(false);
    } catch {
      // Errors are handled by mutation hooks with toast feedback.
    }
  };

  return (
    <main className="space-y-6">
      <PageHeader
        title="Movimentacoes"
        description="Registre entradas e saidas para manter o estoque atualizado."
        action={
          <Button onClick={() => setIsFormDialogOpen(true)} disabled={!canCreateMove}>
            <Plus className="size-4" />
            Nova movimentacao
          </Button>
        }
      />

      <Card>
        <CardHeader className="space-y-4">
          <div className="space-y-1">
            <CardTitle>Historico de movimentacoes</CardTitle>
            <CardDescription>
              Filtre por produto, acompanhe entradas/saidas e confira o valor total por movimento.
            </CardDescription>
          </div>
          <MoveProductFilter
            products={products}
            selectedProductId={selectedProductId}
            isLoading={productsQuery.isLoading}
            onChange={handleFilterChange}
          />
        </CardHeader>

        <CardContent>
          <MoveTable
            moves={moves}
            isLoading={movesQuery.isLoading}
            isFetching={movesQuery.isFetching}
            isError={movesQuery.isError}
            error={movesQuery.error}
            isFiltered={isFiltered}
            offset={offset}
            pageSize={PAGE_SIZE}
            hasMore={hasMore}
            onRetry={() => {
              void movesQuery.refetch();
            }}
            onOffsetChange={setOffset}
          />
        </CardContent>
      </Card>

      <MoveFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        products={products}
        productsLoading={productsQuery.isLoading}
        productsError={productsQuery.error}
        isSubmitting={createMoveMutation.isPending}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
