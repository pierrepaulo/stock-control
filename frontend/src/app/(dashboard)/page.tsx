"use client";

import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { InventoryValueCard } from "@/components/dashboard/inventory-value-card";
import { LowStockTable } from "@/components/dashboard/low-stock-table";
import { MovesChart } from "@/components/dashboard/moves-chart";
import { MovesSummaryCard } from "@/components/dashboard/moves-summary-card";
import { StagnantProductsTable } from "@/components/dashboard/stagnant-products-table";
import { PageHeader } from "@/components/shared/page-header";
import type { DateRangeParams } from "@/types/dashboard";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";

const DEFAULT_RANGE_DAYS = 30;

const getDefaultDateRange = (): DateRange => {
  const endDate = new Date();
  endDate.setHours(0, 0, 0, 0);

  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - (DEFAULT_RANGE_DAYS - 1));

  return { from: startDate, to: endDate };
};

const toApiDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const toDateRangeParams = (range: DateRange | undefined): DateRangeParams => ({
  startDate: range?.from ? toApiDate(range.from) : undefined,
  endDate: range?.to ? toApiDate(range.to) : undefined,
});

export default function DashboardHomePage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(getDefaultDateRange);

  const dateRangeParams = useMemo(() => toDateRangeParams(dateRange), [dateRange]);

  return (
    <main className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Acompanhe metricas de estoque e movimentacoes em tempo real."
        action={<DateRangeFilter value={dateRange} onChange={setDateRange} />}
      />

      <section className="grid gap-4 md:grid-cols-3">
        <InventoryValueCard />
        <MovesSummaryCard dateRange={dateRangeParams} />
      </section>

      <MovesChart dateRange={dateRangeParams} />

      <section className="grid gap-4 xl:grid-cols-2">
        <LowStockTable />
        <StagnantProductsTable dateRange={dateRangeParams} />
      </section>
    </main>
  );
}
