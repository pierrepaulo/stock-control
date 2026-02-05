import { Router, Request, Response } from "express";
import userRoutes from "./user.routes";
import authRoutes from "./auth.routes";
import categoriesRoutes from "./category.routes";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/ping", (req: Request, res: Response) => {
  res.json({ pong: true });
});

router.use("/auth", authRoutes);
router.use(authMiddleware);
router.use("/users", userRoutes);
router.use("/categories", categoriesRoutes);

export default router;
