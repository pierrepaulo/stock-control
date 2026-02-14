"use client";

import { useInventoryValue } from "@/hooks/use-dashboard";
import { formatCurrency } from "@/lib/format";
import { DollarSign } from "lucide-react";
import { StatCard } from "./stat-card";

export function InventoryValueCard() {
  const inventoryValueQuery = useInventoryValue();

  const totalValue = inventoryValueQuery.data?.totalValue;
  const value = totalValue !== undefined ? formatCurrency(totalValue) : "--";

  return (
    <StatCard
      title="Valor do inventario"
      value={value}
      icon={<DollarSign className="size-4" />}
      description={
        inventoryValueQuery.isError
          ? "Nao foi possivel carregar o valor total."
          : "Soma de quantidade x preco unitario dos produtos ativos."
      }
      isLoading={inventoryValueQuery.isLoading}
    />
  );
}
