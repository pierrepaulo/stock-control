import { RequestHandler } from "express";
import {
  createMoveSchema,
  listMovesSchema,
} from "../validators/move.validator";
import * as moveService from "../services/move.service";
import { AppError } from "../utils/apperror";

export const createMove: RequestHandler = async (req, res) => {
  if (!req.user) {
    throw new AppError("Usuário não autenticado", 401);
  }

  const data = createMoveSchema.parse(req.body);

  const move = await moveService.createMove({
    ...data,
    userId: req.user.id,
  });

  res.status(201).json({ error: null, data: move });
};

export const listMoves: RequestHandler = async (req, res) => {
  const query = listMovesSchema.parse(req.query);
  const moves = await moveService.listMoves(query);
  res.status(200).json({ error: null, data: moves });
};
