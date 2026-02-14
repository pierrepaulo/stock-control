"use client";

import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStagnantProducts } from "@/hooks/use-dashboard";
import { formatCurrency, formatQuantity } from "@/lib/format";
import type { DateRangeParams } from "@/types/dashboard";
import type { ProductRaw } from "@/types/product";
import { Box } from "lucide-react";

interface StagnantProductsTableProps {
  dateRange: DateRangeParams;
}

const parseNumericString = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function StagnantProductsTable({ dateRange }: StagnantProductsTableProps) {
  const stagnantProductsQuery = useStagnantProducts(dateRange);
  const products = stagnantProductsQuery.data ?? [];

  const columns: DataTableColumn<ProductRaw>[] = [
    {
      id: "name",
      header: "Nome",
      cell: (product) => <span className="font-medium">{product.name}</span>,
      skeleton: <Skeleton className="h-4 w-36" />,
    },
    {
      id: "quantity",
      header: "Qtd em estoque",
      cell: (product) => formatQuantity(product.quantity),
      skeleton: <Skeleton className="h-4 w-16" />,
    },
    {
      id: "unitPrice",
      header: "Preco unit.",
      cell: (product) => formatCurrency(product.unitPrice),
      skeleton: <Skeleton className="h-4 w-20" />,
    },
    {
      id: "totalValue",
      header: "Valor total",
      cell: (product) =>
        formatCurrency(parseNumericString(product.quantity) * product.unitPrice),
      skeleton: <Skeleton className="h-4 w-24" />,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtos estagnados</CardTitle>
        <CardDescription>
          Produtos sem movimentacoes de saida no periodo filtrado.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {stagnantProductsQuery.isError ? (
          <EmptyState
            tone="danger"
            title="Nao foi possivel carregar os produtos estagnados."
            description="Tente novamente para atualizar os dados."
            action={
              <Button
                type="button"
                variant="outline"
                onClick={() => void stagnantProductsQuery.refetch()}
              >
                Tentar novamente
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={columns}
            data={products}
            getRowId={(product) => product.id}
            isLoading={stagnantProductsQuery.isLoading}
            loadingRowCount={5}
            emptyState={
              <EmptyState
                icon={<Box className="size-5" />}
                title="Sem produtos estagnados no periodo."
                description="Todos os produtos tiveram saida no intervalo selecionado."
              />
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
