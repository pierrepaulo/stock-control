import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller";

const router = Router();

router.get("/inventory-value", dashboardController.getInventoryValue);

export default router;
