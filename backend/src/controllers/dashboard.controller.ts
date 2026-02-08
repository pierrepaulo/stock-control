import { RequestHandler } from "express";
import * as dashboardService from "../services/dashboard.service";
import { dateRangeSchema } from "../validators/dashboard.validator";

export const getInventoryValue: RequestHandler = async (req, res) => {
  const totalValue = await dashboardService.getInventoryValue();
  res.status(200).json({ error: null, data: { totalValue } });
};

export const getMovesSummary: RequestHandler = async (req, res) => {
  const query = dateRangeSchema.parse(req.query);
  const data = await dashboardService.getMovesSummary(query);
  res.status(200).json({ error: null, data });
};

export const getMovesGraph: RequestHandler = async (req, res) => {
  const query = dateRangeSchema.parse(req.query);
  const data = await dashboardService.getMovesGraph(query);
  res.status(200).json({ error: null, data });
};

export const getLowStockProducts: RequestHandler = async (req, res) => {
  const data = await dashboardService.getLowStockProducts();
  res.status(200).json({ error: null, data });
};

export const getStagnantProducts: RequestHandler = async (req, res) => {
  const query = dateRangeSchema.parse(req.query);
  const data = await dashboardService.getStagnantProducts(query);
  res.status(200).json({ error: null, data });
};
