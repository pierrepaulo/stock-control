import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller";

const router = Router();

router.get("/inventory-value", dashboardController.getInventoryValue);
router.get("/moves-summary", dashboardController.getMovesSummary);

export default router;
