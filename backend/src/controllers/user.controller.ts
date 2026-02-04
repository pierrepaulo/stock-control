import { RequestHandler } from "express";
import { createUserSchema } from "../validators/user.validator";
import * as userService from "../services/user.service";

export const createUser: RequestHandler = async (req, res) => {
  const data = createUserSchema.parse(req.body);
  const user = await userService.createUser(data);
  res.status(201).json({ error: null, data: user });
};
