import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import type { CategoryWithCount } from "@/types/category";
import { FolderTree, Pencil, RefreshCcw, Trash2 } from "lucide-react";

interface CategoryTableProps {
  categories: CategoryWithCount[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  offset: number;
  pageSize: number;
  hasMore: boolean;
  onRetry: () => void;
  onOffsetChange: (offset: number) => void;
  onEdit: (category: CategoryWithCount) => void;
  onDelete: (category: CategoryWithCount) => void;
}

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export function CategoryTable({
  categories,
  isLoading,
  isFetching,
  isError,
  error,
  offset,
  pageSize,
  hasMore,
  onRetry,
  onOffsetChange,
  onEdit,
  onDelete,
}: CategoryTableProps) {
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
            onClick={() => onEdit(category)}
            aria-label={`Editar categoria ${category.name}`}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            onClick={() => onDelete(category)}
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

  if (isError) {
    return (
      <EmptyState
        tone="danger"
        title="Nao foi possivel carregar as categorias."
        description={getErrorMessage(
          error,
          "Erro inesperado ao consultar categorias."
        )}
        icon={<RefreshCcw className="size-5" />}
        action={
          <Button type="button" variant="outline" onClick={onRetry}>
            <RefreshCcw className="size-4" />
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
        data={categories}
        getRowId={(category) => category.id}
        isLoading={isLoading}
        loadingRowCount={5}
        emptyState={
          <EmptyState
            title="Nenhuma categoria cadastrada."
            description="Crie a primeira categoria para organizar os produtos."
            icon={<FolderTree className="size-5" />}
          />
        }
      />

      {!isLoading && categories.length > 0 ? (
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
