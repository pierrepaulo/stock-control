import { RequestHandler } from "express";
import * as dashboardService from "../services/dashboard.service";

export const getInventoryValue: RequestHandler = async (req, res) => {
  const totalValue = await dashboardService.getInventoryValue();
  res.status(200).json({ error: null, data: { totalValue } });
};
