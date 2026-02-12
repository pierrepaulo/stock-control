import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatCurrency,
  formatQuantity,
  unitTypeShortLabels,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { Package, Pencil, Trash2 } from "lucide-react";

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  normalizedSearch: string;
  offset: number;
  pageSize: number;
  hasMore: boolean;
  onRetry: () => void;
  onOffsetChange: (offset: number) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const parseNumericString = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export function ProductTable({
  products,
  isLoading,
  isFetching,
  isError,
  error,
  normalizedSearch,
  offset,
  pageSize,
  hasMore,
  onRetry,
  onOffsetChange,
  onEdit,
  onDelete,
}: ProductTableProps) {
  const columns: DataTableColumn<Product>[] = [
    {
      id: "name",
      header: "Nome",
      cell: (product) => <span className="font-medium">{product.name}</span>,
      skeleton: <Skeleton className="h-4 w-36" />,
    },
    {
      id: "category",
      header: "Categoria",
      cell: (product) => product.categoryName ?? "-",
      skeleton: <Skeleton className="h-4 w-24" />,
    },
    {
      id: "unitPrice",
      header: "Preco unitario",
      cell: (product) => formatCurrency(product.unitPrice),
      skeleton: <Skeleton className="h-4 w-20" />,
    },
    {
      id: "unitType",
      header: "Tipo",
      cell: (product) => unitTypeShortLabels[product.unitType],
      skeleton: <Skeleton className="h-4 w-12" />,
    },
    {
      id: "quantity",
      header: "Quantidade",
      cell: (product) => {
        const quantity = parseNumericString(product.quantity);
        const minimumQuantity = parseNumericString(product.minimumQuantity);
        const isLowStock = quantity <= minimumQuantity;

        return (
          <span className={cn(isLowStock && "font-medium text-red-600")}>
            {formatQuantity(product.quantity)}
          </span>
        );
      },
      skeleton: <Skeleton className="h-4 w-16" />,
    },
    {
      id: "minimumQuantity",
      header: "Qtd Min",
      cell: (product) => formatQuantity(product.minimumQuantity),
      skeleton: <Skeleton className="h-4 w-16" />,
    },
    {
      id: "maximumQuantity",
      header: "Qtd Max",
      cell: (product) => formatQuantity(product.maximumQuantity),
      skeleton: <Skeleton className="h-4 w-16" />,
    },
    {
      id: "actions",
      header: "Acoes",
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (product) => (
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => onEdit(product)}
            aria-label={`Editar produto ${product.name}`}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            onClick={() => onDelete(product)}
            aria-label={`Excluir produto ${product.name}`}
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

  if (isError) {
    return (
      <EmptyState
        tone="danger"
        title="Nao foi possivel carregar os produtos."
        description={getErrorMessage(
          error,
          "Erro inesperado ao consultar produtos."
        )}
        action={
          <Button type="button" variant="outline" onClick={onRetry}>
            Tentar novamente
          </Button>
        }
      />
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={products}
        getRowId={(product) => product.id}
        isLoading={isLoading}
        loadingRowCount={5}
        emptyState={
          <EmptyState
            icon={<Package className="size-5" />}
            title={
              normalizedSearch
                ? "Nenhum produto encontrado para este filtro."
                : "Nenhum produto cadastrado."
            }
            description={
              normalizedSearch
                ? "Tente outro termo de busca com pelo menos 2 caracteres."
                : "Crie o primeiro produto para iniciar o controle de estoque."
            }
          />
        }
      />

      {!isLoading && products.length > 0 ? (
        <div className="mt-4">
          <DataTablePagination
            offset={offset}
            limit={pageSize}
            hasMore={hasMore}
            isLoading={isFetching}
            onOffsetChange={onOffsetChange}
          />
        </div>
      ) : null}
    </>
  );
}
