import { Button } from "@/components/ui/button";

interface DataTablePaginationProps {
  offset: number;
  limit: number;
  hasMore: boolean;
  isLoading?: boolean;
  onOffsetChange: (offset: number) => void;
}

export function DataTablePagination({
  offset,
  limit,
  hasMore,
  isLoading = false,
  onOffsetChange,
}: DataTablePaginationProps) {
  const currentPage = Math.floor(offset / limit) + 1;
  const canGoPrevious = offset > 0;
  const canGoNext = hasMore;

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-muted-foreground text-sm">Pagina {currentPage}</p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOffsetChange(Math.max(0, offset - limit))}
          disabled={isLoading || !canGoPrevious}
        >
          Anterior
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOffsetChange(offset + limit)}
          disabled={isLoading || !canGoNext}
        >
          Proxima
        </Button>
      </div>
    </div>
  );
}
