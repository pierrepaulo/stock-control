import { describe, it, expect, vi, beforeAll, beforeEach, afterAll } from "vitest";
import supertest from "supertest";
import {
  startDatabase,
  cleanDatabase,
  stopDatabase,
  type TestDatabase,
} from "../helpers/db.helper.js";
import { insertUser } from "../helpers/factories.js";
import { createAuthenticatedUser, getAuthHeader } from "../helpers/auth.helper.js";

let testDb: TestDatabase;

vi.mock("../../src/db/connection.js", () => ({
  get db() {
    return testDb.db;
  },
}));

vi.mock("../../src/services/file.service.js", () => ({
  saveAvatar: vi.fn().mockResolvedValue("test-avatar.jpg"),
  deleteAvatar: vi.fn().mockResolvedValue(undefined),
}));

const { default: app } = await import("../../src/app.js");

describe("Users E2E", () => {
  beforeAll(async () => {
    testDb = await startDatabase();
  });

  beforeEach(async () => {
    await cleanDatabase(testDb.db);
  });

  afterAll(async () => {
    await stopDatabase(testDb);
  });

  describe("POST /api/users", () => {
    it("201 com user criado, formato correto", async () => {
      const { token } = await createAuthenticatedUser(testDb.db, {
        isAdmin: true,
      });

      const res = await supertest(app)
        .post("/api/users")
        .set("Authorization", getAuthHeader(token))
        .send({
          name: "Novo Usuario",
          email: "novo@test.com",
          password: "senha123",
        });

      expect(res.status).toBe(201);
      expect(res.body.error).toBeNull();
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data.name).toBe("Novo Usuario");
      expect(res.body.data.email).toBe("novo@test.com");
      expect(res.body.data).toHaveProperty("isAdmin");
      expect(res.body.data).not.toHaveProperty("password");
    });

    it("403 quando usuario nao admin tenta criar", async () => {
      const { token } = await createAuthenticatedUser(testDb.db, {
        isAdmin: false,
      });

      const res = await supertest(app)
        .post("/api/users")
        .set("Authorization", getAuthHeader(token))
        .send({
          name: "Sem permissao",
          email: "sem-permissao@test.com",
          password: "senha123",
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("Apenas administradores podem gerenciar usuarios");
      expect(res.body.data).toBeNull();
    });

    it("401 sem auth token", async () => {
      const res = await supertest(app).post("/api/users").send({
        name: "Sem Auth",
        email: "noauth@test.com",
        password: "senha123",
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
      expect(res.body.data).toBeNull();
    });
  });

  describe("PUT /api/users/:id", () => {
    it("multipart form data com avatar", async () => {
      const { user, token } = await createAuthenticatedUser(testDb.db, {
        isAdmin: true,
      });

      const fakeImage = Buffer.from("fake-image-data-for-testing");

      const res = await supertest(app)
        .put(`/api/users/${user.id}`)
        .set("Authorization", getAuthHeader(token))
        .field("name", "Nome Atualizado")
        .attach("avatar", fakeImage, "avatar.jpg");

      expect(res.status).toBe(200);
      expect(res.body.error).toBeNull();
      expect(res.body.data.name).toBe("Nome Atualizado");
      expect(res.body.data).toHaveProperty("avatar");
    });

    it("200 quando non-admin edita proprio perfil", async () => {
      const { user, token } = await createAuthenticatedUser(testDb.db, {
        isAdmin: false,
      });

      const res = await supertest(app)
        .put(`/api/users/${user.id}`)
        .set("Authorization", getAuthHeader(token))
        .field("name", "Meu Novo Nome");

      expect(res.status).toBe(200);
      expect(res.body.error).toBeNull();
      expect(res.body.data.name).toBe("Meu Novo Nome");
    });

    it("200 quando non-admin faz upload de avatar no proprio perfil", async () => {
      const { user, token } = await createAuthenticatedUser(testDb.db, {
        isAdmin: false,
      });

      const fakeImage = Buffer.from("fake-image-data-for-testing");

      const res = await supertest(app)
        .put(`/api/users/${user.id}`)
        .set("Authorization", getAuthHeader(token))
        .field("name", "Nome com Avatar")
        .attach("avatar", fakeImage, "avatar.jpg");

      expect(res.status).toBe(200);
      expect(res.body.error).toBeNull();
      expect(res.body.data.name).toBe("Nome com Avatar");
      expect(res.body.data).toHaveProperty("avatar");
    });

    it("403 quando non-admin tenta atualizar outro usuario", async () => {
      const { token } = await createAuthenticatedUser(testDb.db, {
        isAdmin: false,
      });
      const targetUser = await insertUser(testDb.db);

      const res = await supertest(app)
        .put(`/api/users/${targetUser.id}`)
        .set("Authorization", getAuthHeader(token))
        .field("name", "Tentativa sem permissao");

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("Apenas administradores podem gerenciar usuarios");
      expect(res.body.data).toBeNull();
    });

    it("aceita isAdmin enviado como string em multipart/form-data", async () => {
      const { token } = await createAuthenticatedUser(testDb.db, {
        isAdmin: true,
      });
      const targetUser = await insertUser(testDb.db, { isAdmin: false });

      const res = await supertest(app)
        .put(`/api/users/${targetUser.id}`)
        .set("Authorization", getAuthHeader(token))
        .field("isAdmin", "true");

      expect(res.status).toBe(200);
      expect(res.body.error).toBeNull();
      expect(res.body.data.isAdmin).toBe(true);
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("200 quando admin exclui usuario", async () => {
      const { token } = await createAuthenticatedUser(testDb.db, {
        isAdmin: true,
      });
      const targetUser = await insertUser(testDb.db);

      const res = await supertest(app)
        .delete(`/api/users/${targetUser.id}`)
        .set("Authorization", getAuthHeader(token));

      expect(res.status).toBe(200);
      expect(res.body.error).toBeNull();
      expect(res.body.data).toBeNull();
    });

    it("403 quando usuario nao admin tenta excluir", async () => {
      const { token } = await createAuthenticatedUser(testDb.db, {
        isAdmin: false,
      });
      const targetUser = await insertUser(testDb.db);

      const res = await supertest(app)
        .delete(`/api/users/${targetUser.id}`)
        .set("Authorization", getAuthHeader(token));

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("Apenas administradores podem gerenciar usuarios");
      expect(res.body.data).toBeNull();
    });
  });
});
