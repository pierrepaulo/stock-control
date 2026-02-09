import { describe, it, expect, vi, beforeAll, beforeEach, afterAll } from "vitest";
import {
  startDatabase,
  cleanDatabase,
  stopDatabase,
  type TestDatabase,
} from "../../helpers/db.helper.js";
import { insertUser } from "../../helpers/factories.js";
import { createAuthenticatedUser } from "../../helpers/auth.helper.js";
import { users } from "../../../src/db/schema/index.js";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { AppError } from "../../../src/utils/apperror.js";

let testDb: TestDatabase;

const mockDeleteAvatar = vi.fn().mockResolvedValue(undefined);

vi.mock("../../../src/db/connection.js", () => ({
  get db() {
    return testDb.db;
  },
}));

vi.mock("../../../src/services/file.service.js", () => ({
  deleteAvatar: (...args: any[]) => mockDeleteAvatar(...args),
  saveAvatar: vi.fn().mockResolvedValue("test-avatar.jpg"),
}));

const userService = await import("../../../src/services/user.service.js");

describe("user.service (integration)", () => {
  beforeAll(async () => {
    testDb = await startDatabase();
  });

  beforeEach(async () => {
    await cleanDatabase(testDb.db);
    vi.clearAllMocks();
  });

  afterAll(async () => {
    await stopDatabase(testDb);
  });

  describe("login", () => {
    it("retorna user com token 64-char hex, sem password", async () => {
      const user = await insertUser(testDb.db, {
        email: "login@test.com",
        password: "password123",
      });

      const result = await userService.login("login@test.com", "password123");

      expect(result).not.toBeNull();
      expect(result!.token).toHaveLength(64);
      expect(result!.email).toBe("login@test.com");
      expect(result!.id).toBe(user.id);
      expect(result).not.toHaveProperty("password");
    });

    it("retorna null para senha errada", async () => {
      await insertUser(testDb.db, {
        email: "wrong@test.com",
        password: "password123",
      });

      const result = await userService.login("wrong@test.com", "senhaerrada");

      expect(result).toBeNull();
    });

    it("retorna null para user soft-deleted", async () => {
      await insertUser(testDb.db, {
        email: "deleted@test.com",
        password: "password123",
        deletedAt: new Date(),
      });

      const result = await userService.login("deleted@test.com", "password123");

      expect(result).toBeNull();
    });
  });

  describe("logout", () => {
    it("limpa token do banco", async () => {
      const { user, token } = await createAuthenticatedUser(testDb.db);

      await userService.logout(token);

      const dbUser = await testDb.db
        .select()
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      expect(dbUser[0].token).toBeNull();
    });
  });

  describe("createUser", () => {
    it("retorna user formatado sem password, hash no DB", async () => {
      const result = await userService.createUser({
        name: "Novo User",
        email: "novo@test.com",
        password: "senha123",
      });

      expect(result).toHaveProperty("id");
      expect(result.name).toBe("Novo User");
      expect(result.email).toBe("novo@test.com");
      expect(result).not.toHaveProperty("password");

      const dbUser = await testDb.db
        .select()
        .from(users)
        .where(eq(users.email, "novo@test.com"))
        .limit(1);

      expect(dbUser[0].password).not.toBe("senha123");
      const isHashed = await bcrypt.compare("senha123", dbUser[0].password);
      expect(isHashed).toBe(true);
    });

    it("throw AppError 400 para email duplicado", async () => {
      await insertUser(testDb.db, { email: "dup@test.com" });

      await expect(
        userService.createUser({
          name: "Dup User",
          email: "dup@test.com",
          password: "senha123",
        }),
      ).rejects.toThrow(AppError);

      await expect(
        userService.createUser({
          name: "Dup User",
          email: "dup@test.com",
          password: "senha123",
        }),
      ).rejects.toThrow("Email já está em uso");
    });
  });

  describe("listUsers", () => {
    it("exclui users soft-deleted", async () => {
      await insertUser(testDb.db, { name: "User 1" });
      await insertUser(testDb.db, { name: "User 2" });
      await insertUser(testDb.db, { name: "Deleted", deletedAt: new Date() });

      const result = await userService.listUsers();

      expect(result).toHaveLength(2);
      expect(result.map((u) => u.name)).not.toContain("Deleted");
    });

    it("respeita offset e limit", async () => {
      for (let i = 0; i < 5; i++) {
        await insertUser(testDb.db, { name: `User ${i}` });
      }

      const result = await userService.listUsers(2, 2);

      expect(result).toHaveLength(2);
    });
  });

  describe("getUserByIdPublic", () => {
    it("retorna user por ID, null para inexistente", async () => {
      const user = await insertUser(testDb.db);

      const result = await userService.getUserByIdPublic(user.id);
      expect(result).not.toBeNull();
      expect(result!.id).toBe(user.id);
      expect(result).not.toHaveProperty("password");

      const notFound = await userService.getUserByIdPublic(randomUUID());
      expect(notFound).toBeNull();
    });
  });

  describe("updateUser", () => {
    it("atualiza nome e rehash password", async () => {
      const user = await insertUser(testDb.db, { password: "oldpass123" });

      const result = await userService.updateUser(user.id, {
        name: "Nome Atualizado",
        password: "newpass123",
      });

      expect(result.name).toBe("Nome Atualizado");

      const dbUser = await testDb.db
        .select()
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      const isNewHash = await bcrypt.compare("newpass123", dbUser[0].password);
      expect(isNewHash).toBe(true);

      const isOldHash = await bcrypt.compare("oldpass123", dbUser[0].password);
      expect(isOldHash).toBe(false);
    });

    it("throw 400 para email duplicado ao alterar", async () => {
      const user1 = await insertUser(testDb.db, { email: "user1@test.com" });
      await insertUser(testDb.db, { email: "user2@test.com" });

      await expect(
        userService.updateUser(user1.id, { email: "user2@test.com" }),
      ).rejects.toThrow("Email já está em uso");
    });

    it("chama deleteAvatar ao trocar avatar", async () => {
      const user = await insertUser(testDb.db, { avatar: "old-avatar.jpg" });

      await userService.updateUser(user.id, { avatar: "new-avatar.jpg" });

      expect(mockDeleteAvatar).toHaveBeenCalledWith("old-avatar.jpg");
    });
  });
});
