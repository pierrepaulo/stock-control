export interface Category {
  id: string;
  name: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryWithCount {
  id: string;
  name: string;
  createdAt: string;
  productCount: number;
}

export interface CreateCategoryInput {
  name: string;
}

export interface UpdateCategoryInput {
  name?: string;
}
