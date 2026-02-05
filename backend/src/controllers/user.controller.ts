import { RequestHandler } from "express";
import {
  createUserSchema,
  getUserByIdSchema,
  listUsersSchema,
} from "../validators/user.validator";
import * as userService from "../services/user.service";
import { AppError } from "../utils/apperror";

export const createUser: RequestHandler = async (req, res) => {
  const data = createUserSchema.parse(req.body);
  const user = await userService.createUser(data);
  res.status(201).json({ error: null, data: user });
};

export const listUsers: RequestHandler = async (req, res) => {
  const { offset, limit } = listUsersSchema.parse(req.query);
  const users = await userService.listUsers(offset, limit);
  res.status(200).json({ error: null, data: users });
};

export const getUser: RequestHandler = async (req, res) => {
  const { id } = getUserByIdSchema.parse(req.params);
  const user = await userService.getUserByIdPublic(id);
  if (!user) throw new AppError("Usuário não encontrado", 404);
  res.status(200).json({ error: null, data: user });
};
