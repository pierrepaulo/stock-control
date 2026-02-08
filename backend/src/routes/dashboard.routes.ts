import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller";

const router = Router();

router.get("/inventory-value", dashboardController.getInventoryValue);
router.get("/moves-summary", dashboardController.getMovesSummary);
router.get("/moves-graph", dashboardController.getMovesGraph);
router.get("/low-stock", dashboardController.getLowStockProducts);
router.get("/stagnant-products", dashboardController.getStagnantProducts);

export default router;
