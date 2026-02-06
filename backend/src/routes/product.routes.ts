import { Router } from "express";
import * as productController from "../controllers/product.controller";

const router = Router();

router.post("/", productController.createProduct);

router.get("/", productController.listProducts);

router.get("/:id", productController.getProduct);

router.put("/:id", productController.updateProduct);

router.delete("/:id", productController.deleteProduct);

export default router;
