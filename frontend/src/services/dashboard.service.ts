import apiClient from "@/lib/api-client";
import type { DateRangeParams, InventoryValue, MovesSummary } from "@/types/dashboard";
import type { MovesGraphPoint } from "@/types/dashboard";
import type { ProductRaw } from "@/types/product";

export const dashboardService = {
  getInventoryValue: () =>
    apiClient.get<InventoryValue>("/dashboard/inventory-value"),

  getMovesSummary: (params?: DateRangeParams) =>
    apiClient.get<MovesSummary>("/dashboard/moves-summary", { params }),

  getMovesGraph: (params?: DateRangeParams) =>
    apiClient.get<MovesGraphPoint[]>("/dashboard/moves-graph", { params }),

  getLowStock: () => apiClient.get<ProductRaw[]>("/dashboard/low-stock"),

  getStagnantProducts: (params?: DateRangeParams) =>
    apiClient.get<ProductRaw[]>("/dashboard/stagnant-products", { params }),
};

