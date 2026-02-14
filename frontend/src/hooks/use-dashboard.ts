"use client";

import { dashboardService } from "@/services/dashboard.service";
import type { DateRangeParams } from "@/types/dashboard";
import { useQuery } from "@tanstack/react-query";

export const dashboardQueryKeys = {
  all: ["dashboard"] as const,
  inventoryValue: () => ["dashboard", "inventory-value"] as const,
  movesSummary: (params?: DateRangeParams) =>
    ["dashboard", "moves-summary", params ?? {}] as const,
  movesGraph: (params?: DateRangeParams) =>
    ["dashboard", "moves-graph", params ?? {}] as const,
  lowStock: () => ["dashboard", "low-stock"] as const,
  stagnantProducts: (params?: DateRangeParams) =>
    ["dashboard", "stagnant-products", params ?? {}] as const,
};

export const useInventoryValue = () =>
  useQuery({
    queryKey: dashboardQueryKeys.inventoryValue(),
    queryFn: () => dashboardService.getInventoryValue(),
  });

export const useMovesSummary = (params?: DateRangeParams) =>
  useQuery({
    queryKey: dashboardQueryKeys.movesSummary(params),
    queryFn: () => dashboardService.getMovesSummary(params),
  });

export const useMovesGraph = (params?: DateRangeParams) =>
  useQuery({
    queryKey: dashboardQueryKeys.movesGraph(params),
    queryFn: () => dashboardService.getMovesGraph(params),
  });

export const useLowStock = () =>
  useQuery({
    queryKey: dashboardQueryKeys.lowStock(),
    queryFn: () => dashboardService.getLowStock(),
  });

export const useStagnantProducts = (params?: DateRangeParams) =>
  useQuery({
    queryKey: dashboardQueryKeys.stagnantProducts(params),
    queryFn: () => dashboardService.getStagnantProducts(params),
  });
