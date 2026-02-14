"use client";

import { useMovesSummary } from "@/hooks/use-dashboard";
import { formatCurrency } from "@/lib/format";
import type { DateRangeParams } from "@/types/dashboard";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { StatCard } from "./stat-card";

interface MovesSummaryCardProps {
  dateRange: DateRangeParams;
}

const formatMovesCount = (count: number) =>
  `${count} ${count === 1 ? "movimentacao" : "movimentacoes"}`;

export function MovesSummaryCard({ dateRange }: MovesSummaryCardProps) {
  const movesSummaryQuery = useMovesSummary(dateRange);

  const entriesValue = movesSummaryQuery.data?.in.value ?? 0;
  const entriesCount = movesSummaryQuery.data?.in.count ?? 0;
  const exitsValue = movesSummaryQuery.data?.out.value ?? 0;
  const exitsCount = movesSummaryQuery.data?.out.count ?? 0;
  const hasError = movesSummaryQuery.isError;

  return (
    <>
      <StatCard
        title="Entradas"
        value={hasError ? "--" : formatCurrency(entriesValue)}
        icon={<ArrowDownCircle className="size-4 text-green-600" />}
        description={
          hasError
            ? "Nao foi possivel carregar os dados."
            : formatMovesCount(entriesCount)
        }
        className="border-green-200/70 bg-green-50/40"
        isLoading={movesSummaryQuery.isLoading}
      />

      <StatCard
        title="Saidas"
        value={hasError ? "--" : formatCurrency(exitsValue)}
        icon={<ArrowUpCircle className="size-4 text-red-600" />}
        description={
          hasError
            ? "Nao foi possivel carregar os dados."
            : formatMovesCount(exitsCount)
        }
        className="border-red-200/70 bg-red-50/40"
        isLoading={movesSummaryQuery.isLoading}
      />
    </>
  );
}
