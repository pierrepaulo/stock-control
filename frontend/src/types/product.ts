export type UnitType = "kg" | "g" | "l" | "ml" | "un";

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string | null;
  unitPrice: number;
  unitType: UnitType;
  quantity: string;
  minimumQuantity: string;
  maximumQuantity: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRaw {
  id: string;
  name: string;
  categoryId: string;
  unitPrice: number;
  unitType: UnitType;
  quantity: string;
  minimumQuantity: string;
  maximumQuantity: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  categoryId: string;
  unitPrice: number;
  unitType: UnitType;
  quantity?: number;
  minimumQuantity?: number;
  maximumQuantity?: number;
}

export interface UpdateProductInput {
  name?: string;
  categoryId?: string;
  unitPrice?: number;
  unitType?: UnitType;
  quantity?: number;
  minimumQuantity?: number;
  maximumQuantity?: number;
}
