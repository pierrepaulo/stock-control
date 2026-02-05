import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { uploadAvatar } from "../middlewares/upload.middleware";

const router = Router();

router.post("/", userController.createUser);

router.get("/", userController.listUsers);

router.get("/:id", userController.getUser);

router.delete("/:id", userController.deleteUser);

router.put("/:id", uploadAvatar, userController.updateUser);

export default router;
