import { RequestHandler } from "express";
import {
  createCategorySchema,
  getCategoryByIdSchema,
  listCategoriesSchema,
  updateCategorySchema,
} from "../validators/category.validator";
import * as categoryService from "../services/category.service";
import { AppError } from "../utils/apperror";

export const createCategory: RequestHandler = async (req, res) => {
  const data = createCategorySchema.parse(req.body);
  const category = await categoryService.createCategory(data);
  res.status(201).json({ error: null, data: category });
};

export const listCategories: RequestHandler = async (req, res) => {
  const { includeProductCount } = listCategoriesSchema.parse(req.query);
  const categories = await categoryService.listCategories(includeProductCount);
  res.status(200).json({ error: null, data: categories });
};

export const getCategory: RequestHandler = async (req, res) => {
  const { id } = getCategoryByIdSchema.parse(req.params);
  const category = await categoryService.getCategoryById(id);
  if (!category) throw new AppError("Categoria não encontrada", 404);
  res.status(200).json({ error: null, data: category });
};

export const updateCategory: RequestHandler = async (req, res) => {
  const { id } = getCategoryByIdSchema.parse(req.params);
  const data = updateCategorySchema.parse(req.body);
  const updatedCategory = await categoryService.updateCategory(id, data);
  if (!updatedCategory) throw new AppError("Categoria não encontrada", 404);
  res.status(200).json({ error: null, data: updatedCategory });
};

export const deleteCategory: RequestHandler = async (req, res) => {
  const { id } = getCategoryByIdSchema.parse(req.params);
  const deletedCategory = await categoryService.deleteCategory(id);
  if (!deletedCategory) throw new AppError("Categoria não encontrada", 404);
  res.status(200).json({ error: null, data: null });
};
