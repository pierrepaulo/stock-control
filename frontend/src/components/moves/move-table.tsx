import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDateTime, formatQuantity } from "@/lib/format";
import type { Move } from "@/types/move";
import { ArrowDownCircle, ArrowUpCircle, ArrowUpDown } from "lucide-react";

interface MoveTableProps {
  moves: Move[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  isFiltered: boolean;
  offset: number;
  pageSize: number;
  hasMore: boolean;
  onRetry: () => void;
  onOffsetChange: (offset: number) => void;
}

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const parseNumericString = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function MoveTable({
  moves,
  isLoading,
  isFetching,
  isError,
  error,
  isFiltered,
  offset,
  pageSize,
  hasMore,
  onRetry,
  onOffsetChange,
}: MoveTableProps) {
  const columns: DataTableColumn<Move>[] = [
    {
      id: "productName",
      header: "Produto",
      cell: (move) => <span className="font-medium">{move.productName ?? "-"}</span>,
      skeleton: <Skeleton className="h-4 w-36" />,
    },
    {
      id: "type",
      header: "Tipo",
      cell: (move) =>
        move.type === "in" ? (
          <Badge className="gap-1">
            <ArrowUpCircle className="size-3.5" />
            Entrada
          </Badge>
        ) : (
          <Badge variant="destructive" className="gap-1">
            <ArrowDownCircle className="size-3.5" />
            Saida
          </Badge>
        ),
      skeleton: <Skeleton className="h-5 w-16 rounded-full" />,
    },
    {
      id: "quantity",
      header: "Quantidade",
      cell: (move) => formatQuantity(move.quantity),
      skeleton: <Skeleton className="h-4 w-14" />,
    },
    {
      id: "unitPrice",
      header: "Preco Unit.",
      cell: (move) => formatCurrency(move.unitPrice),
      skeleton: <Skeleton className="h-4 w-20" />,
    },
    {
      id: "totalValue",
      header: "Valor Total",
      cell: (move) =>
        formatCurrency(parseNumericString(move.quantity) * move.unitPrice),
      skeleton: <Skeleton className="h-4 w-20" />,
    },
    {
      id: "createdAt",
      header: "Data",
      cell: (move) => formatDateTime(move.createdAt),
      skeleton: <Skeleton className="h-4 w-28" />,
    },
  ];

  if (isError) {
    return (
      <EmptyState
        tone="danger"
        title="Nao foi possivel carregar as movimentacoes."
        description={getErrorMessage(
          error,
          "Erro inesperado ao consultar movimentacoes."
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
        data={moves}
        getRowId={(move) => move.id}
        isLoading={isLoading}
        loadingRowCount={5}
        emptyState={
          <EmptyState
            icon={<ArrowUpDown className="size-5" />}
            title={
              isFiltered
                ? "Nenhuma movimentacao encontrada para este produto."
                : "Nenhuma movimentacao registrada."
            }
            description={
              isFiltered
                ? "Tente selecionar outro produto no filtro."
                : "Registre uma entrada ou saida para iniciar o historico."
            }
          />
        }
      />

      {!isLoading && moves.length > 0 ? (
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
