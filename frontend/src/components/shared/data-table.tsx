import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface DataTableColumn<TData> {
  id: string;
  header: ReactNode;
  cell: (row: TData, index: number) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  skeleton?: ReactNode;
}

interface DataTableProps<TData> {
  columns: DataTableColumn<TData>[];
  data: TData[];
  getRowId: (row: TData, index: number) => string;
  isLoading?: boolean;
  loadingRowCount?: number;
  emptyState?: ReactNode;
  tableClassName?: string;
}

export function DataTable<TData>({
  columns,
  data,
  getRowId,
  isLoading = false,
  loadingRowCount = 5,
  emptyState,
  tableClassName,
}: DataTableProps<TData>) {
  return (
    <Table className={tableClassName}>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.id} className={cn("bg-muted/50 text-xs font-medium uppercase tracking-wider", column.headerClassName)}>
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {isLoading
          ? Array.from({ length: loadingRowCount }).map((_, rowIndex) => (
              <TableRow key={`loading-${rowIndex}`}>
                {columns.map((column) => (
                  <TableCell
                    key={`${column.id}-loading-${rowIndex}`}
                    className={column.cellClassName}
                  >
                    {column.skeleton ?? <Skeleton className="h-4 w-24" />}
                  </TableCell>
                ))}
              </TableRow>
            ))
          : null}

        {!isLoading && data.length > 0
          ? data.map((row, index) => (
              <TableRow key={getRowId(row, index)} className="hover:bg-muted/30">
                {columns.map((column) => (
                  <TableCell
                    key={`${column.id}-${getRowId(row, index)}`}
                    className={cn(column.cellClassName)}
                  >
                    {column.cell(row, index)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          : null}

        {!isLoading && data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="p-0">
              {emptyState ?? (
                <div className="text-muted-foreground flex h-24 items-center justify-center text-center text-sm">
                  Nenhum registro encontrado.
                </div>
              )}
            </TableCell>
          </TableRow>
        ) : null}
      </TableBody>
    </Table>
  );
}
