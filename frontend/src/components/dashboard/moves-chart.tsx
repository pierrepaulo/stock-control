"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMovesGraph } from "@/hooks/use-dashboard";
import { formatCurrency } from "@/lib/format";
import type { DateRangeParams, MovesGraphPoint } from "@/types/dashboard";
import { BarChart3 } from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

interface MovesChartProps {
  dateRange: DateRangeParams;
}

interface MovesChartRow extends MovesGraphPoint {
  shortDate: string;
  fullDate: string;
}

const formatShortDate = (isoDate: string): string => {
  const [year, month, day] = isoDate.split("-");
  return year && month && day ? `${day}/${month}` : isoDate;
};

const formatFullDate = (isoDate: string): string => {
  const [year, month, day] = isoDate.split("-");
  return year && month && day ? `${day}/${month}/${year}` : isoDate;
};

export function MovesChart({ dateRange }: MovesChartProps) {
  const movesGraphQuery = useMovesGraph(dateRange);

  const chartData = useMemo<MovesChartRow[]>(
    () =>
      (movesGraphQuery.data ?? []).map((point) => ({
        ...point,
        shortDate: formatShortDate(point.date),
        fullDate: formatFullDate(point.date),
      })),
    [movesGraphQuery.data],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Movimentacoes de saida por dia</CardTitle>
        <CardDescription>
          Valor diario das saidas no periodo selecionado.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {movesGraphQuery.isLoading ? (
          <Skeleton className="h-80 w-full" />
        ) : null}

        {!movesGraphQuery.isLoading && movesGraphQuery.isError ? (
          <EmptyState
            tone="danger"
            title="Nao foi possivel carregar o grafico."
            description="Tente novamente para atualizar os dados de movimentacoes."
            action={
              <Button
                type="button"
                variant="outline"
                onClick={() => void movesGraphQuery.refetch()}
              >
                Tentar novamente
              </Button>
            }
          />
        ) : null}

        {!movesGraphQuery.isLoading &&
        !movesGraphQuery.isError &&
        chartData.length === 0 ? (
          <EmptyState
            icon={<BarChart3 className="size-5" />}
            title="Sem saidas no periodo selecionado."
            description="Ajuste o intervalo de datas para visualizar movimentacoes."
          />
        ) : null}

        {!movesGraphQuery.isLoading &&
        !movesGraphQuery.isError &&
        chartData.length > 0 ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartData.length === 1 ? (
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 8, left: 8, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="shortDate"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={88}
                    tickFormatter={(value) => formatCurrency(Number(value))}
                  />
                  <RechartsTooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    labelFormatter={(_, payload) => {
                      const row = payload?.[0]?.payload as
                        | MovesChartRow
                        | undefined;
                      return row?.fullDate ?? "";
                    }}
                  />
                  <Bar
                    dataKey="totalValue"
                    name="Saidas"
                    fill="var(--chart-1)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={80}
                  />
                </BarChart>
              ) : (
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 8, left: 8, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="shortDate"
                    tickLine={false}
                    axisLine={false}
                    minTickGap={20}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={88}
                    tickFormatter={(value) => formatCurrency(Number(value))}
                  />
                  <RechartsTooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    labelFormatter={(_, payload) => {
                      const row = payload?.[0]?.payload as
                        | MovesChartRow
                        | undefined;
                      return row?.fullDate ?? "";
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="totalValue"
                    name="Saidas"
                    stroke="var(--chart-1)"
                    fill="var(--chart-1)"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
