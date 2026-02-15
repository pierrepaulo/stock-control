"use client";

import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLowStock } from "@/hooks/use-dashboard";
import { formatCurrency, formatQuantity } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProductRaw } from "@/types/product";
import { AlertTriangle } from "lucide-react";

const parseNumericString = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const isCriticalStock = (product: ProductRaw) =>
  parseNumericString(product.quantity) <= parseNumericString(product.minimumQuantity);

export function LowStockTable() {
  const lowStockQuery = useLowStock();
  const products = lowStockQuery.data ?? [];

  const columns: DataTableColumn<ProductRaw>[] = [
    {
      id: "name",
      header: "Nome",
      cell: (product) => <span className="font-medium">{product.name}</span>,
      skeleton: <Skeleton className="h-4 w-36" />,
    },
    {
      id: "quantity",
      header: "Qtd atual",
      cell: (product) => <span className="font-mono-data">{formatQuantity(product.quantity)}</span>,
      skeleton: <Skeleton className="h-4 w-16" />,
    },
    {
      id: "minimumQuantity",
      header: "Qtd minima",
      cell: (product) => <span className="font-mono-data">{formatQuantity(product.minimumQuantity)}</span>,
      skeleton: <Skeleton className="h-4 w-16" />,
    },
    {
      id: "unitPrice",
      header: "Preco unit.",
      cell: (product) => <span className="font-mono-data">{formatCurrency(product.unitPrice)}</span>,
      skeleton: <Skeleton className="h-4 w-20" />,
    },
    {
      id: "status",
      header: "Status",
      cell: (product) => {
        const critical = isCriticalStock(product);

        return (
          <Badge
            variant="outline"
            className={cn(
              critical
                ? "border-red-200 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
                : "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400"
            )}
          >
            {critical ? "Critico" : "Alerta"}
          </Badge>
        );
      },
      skeleton: <Skeleton className="h-5 w-16 rounded-full" />,
    },
  ];

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Estoque baixo</CardTitle>
        <CardDescription>
          Produtos com quantidade atual proxima ou abaixo do minimo.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {lowStockQuery.isError ? (
          <EmptyState
            tone="danger"
            title="Nao foi possivel carregar o estoque baixo."
            description="Tente novamente para atualizar a lista de produtos."
            action={
              <Button type="button" variant="outline" onClick={() => void lowStockQuery.refetch()}>
                Tentar novamente
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={columns}
            data={products}
            getRowId={(product) => product.id}
            isLoading={lowStockQuery.isLoading}
            loadingRowCount={5}
            emptyState={
              <EmptyState
                icon={<AlertTriangle className="size-5" />}
                title="Nenhum produto em alerta de estoque."
                description="Todos os produtos estao com nivel de estoque adequado."
              />
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
