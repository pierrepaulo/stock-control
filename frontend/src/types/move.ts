export type MoveType = "in" | "out";

export interface Move {
  id: string;
  productId: string;
  productName: string | null;
  userId: string;
  type: MoveType;
  quantity: string;
  unitPrice: number;
  createdAt: string;
}

export interface CreateMoveInput {
  productId: string;
  type: MoveType;
  quantity: number;
  unitPrice?: number;
}
