import { NewUser, User, users } from "../db/schema";
import { db } from "../db/connection";
import { eq, isNull } from "drizzle-orm";
import bcrypt from "bcrypt";
import { AppError } from "../utils/apperror";
import crypto from "crypto";
import { deleteAvatar } from "./file.service";

export const login = async (email: string, password: string) => {
  const user = await getUserByEmail(email);
  if (!user) return null;

  const isPasswordValid = await verifyPassword(password, user.password);
  if (!isPasswordValid) return null;

  const token = crypto.randomBytes(32).toString("hex");

  await db
    .update(users)
    .set({ token, updatedAt: new Date() })
    .where(eq(users.id, user.id));

  const userFormatted = formatUser(user);
  return { ...userFormatted, token };
};

export const logout = async (token: string) => {
  await db
    .update(users)
    .set({ token: null, updatedAt: new Date() })
    .where(eq(users.token, token));
};

export const createUser = async (data: NewUser) => {
  const existingUser = await getUserByEmail(data.email);
  if (existingUser) {
    throw new AppError("Email já está em uso", 400);
  }

  const hashedPassword = await hashPassword(data.password);

  const newUser: NewUser = {
    ...data,
    password: hashedPassword,
  };
  const result = await db.insert(users).values(newUser).returning();
  const user = result[0];

  return formatUser(user);
};

export const listUsers = async (offset: number = 0, limit: number = 10) => {
  const userList = await db
    .select()
    .from(users)
    .where(isNull(users.deletedAt))
    .offset(offset)
    .limit(limit);
  return userList.map(formatUser);
};

export const deleteUser = async (id: string) => {
  const result = await db
    .update(users)
    .set({ deletedAt: new Date() })
    .where(eq(users.id, id))
    .returning();

  return result[0] ?? null;
};

export const updateUser = async (id: string, data: Partial<NewUser>) => {
  const userToUpdate = await getUserById(id);
  if (!userToUpdate) throw new AppError("Usuário não encontrado", 404);

  if (data.email && data.email !== userToUpdate.email) {
    const emailInUse = await getUserByEmail(data.email);
    if (emailInUse) {
      throw new AppError("Email já está em uso", 400);
    }
  }

  const updateData: Partial<NewUser> = { ...data };
  if (data.password) {
    updateData.password = await hashPassword(data.password);
  }

  if (
    data.avatar &&
    userToUpdate.avatar &&
    data.avatar !== userToUpdate.avatar
  ) {
    await deleteAvatar(userToUpdate.avatar);
  }

  updateData.updatedAt = new Date();
  const result = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, id))
    .returning();
  const updatedUser = result[0];

  return formatUser(updatedUser);
};

export const validateToken = async (token: string) => {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.token, token))
    .limit(1);

  const user = result[0];
  if (!user || user.deletedAt) return null;
  return user;
};

export const getUserById = async (id: string) => {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  const user = result[0];
  if (!user || user.deletedAt) return null;
  return user;
};

export const getUserByIdPublic = async (id: string) => {
  const user = await getUserById(id);
  if (!user) return null;
  return formatUser(user);
};

export const getUserByEmail = async (
  email: string,
  includeDeleted: boolean = false,
) => {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const user = result[0];
  if (!user) return null;
  if (user && user.deletedAt && includeDeleted === false) return null;
  return user;
};

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 10);
};
export const verifyPassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

export const formatUser = (user: User) => {
  const { password, ...userWithoutPassword } = user;

  if (userWithoutPassword.avatar) {
    userWithoutPassword.avatar = `${process.env.BASE_URL}/static/avatars/${userWithoutPassword.avatar}`;
  }

  const { id, name, email, avatar, isAdmin } = userWithoutPassword;

  return { id, name, email, avatar, isAdmin };
};
