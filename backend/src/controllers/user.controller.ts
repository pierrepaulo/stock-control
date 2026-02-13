import { RequestHandler } from "express";
import {
  createUserSchema,
  getUserByIdSchema,
  listUsersSchema,
  updateProfileSchema,
  updateUserSchema,
} from "../validators/user.validator";
import * as userService from "../services/user.service";
import { AppError } from "../utils/apperror";
import { saveAvatar } from "../services/file.service";

const ensureAdmin = (isAdmin?: boolean) => {
  if (!isAdmin) {
    throw new AppError("Apenas administradores podem gerenciar usuarios", 403);
  }
};

export const createUser: RequestHandler = async (req, res) => {
  ensureAdmin(req.user?.isAdmin);

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

export const updateUser: RequestHandler = async (req, res) => {
  const { id } = getUserByIdSchema.parse(req.params);
  const isAdmin = req.user?.isAdmin === true;
  const isSelf = req.user?.id === id;

  if (!isAdmin && !isSelf) {
    throw new AppError("Apenas administradores podem gerenciar usuarios", 403);
  }

  const data = isAdmin
    ? updateUserSchema.parse(req.body)
    : updateProfileSchema.parse(req.body);

  let avatarFileName: string | undefined;
  if (req.file) {
    avatarFileName = await saveAvatar(req.file.buffer, req.file.originalname);
  }

  const updateData = { ...data };
  if (avatarFileName) updateData.avatar = avatarFileName;

  const updatedUser = await userService.updateUser(id, updateData);
  res.status(200).json({ error: null, data: updatedUser });
};

export const deleteUser: RequestHandler = async (req, res) => {
  ensureAdmin(req.user?.isAdmin);

  const { id } = getUserByIdSchema.parse(req.params);
  const deletedUser = await userService.deleteUser(id);
  if (!deletedUser) throw new AppError("Usuário não encontrado", 404);
  res.status(200).json({ error: null, data: null });
};

