export interface InventoryValue {
  totalValue: number;
}

export interface MovesSummary {
  in: { value: number; count: number };
  out: { value: number; count: number };
}

export interface MovesGraphPoint {
  date: string;
  totalValue: number;
}

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}
