import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATION_PATH = path.join(__dirname, "../../drizzle/0000_broken_electro.sql");

export interface TestDatabase {
  container: StartedPostgreSqlContainer;
  db: PostgresJsDatabase;
  connectionString: string;
  client: postgres.Sql;
}

export async function startDatabase(): Promise<TestDatabase> {
  const container = await new PostgreSqlContainer("postgres:16-alpine").start();
  const connectionString = container.getConnectionUri();
  const client = postgres(connectionString);
  const db = drizzle(client);

  await applyMigrations(client);

  return { container, db, connectionString, client };
}

async function applyMigrations(client: postgres.Sql): Promise<void> {
  const migrationSql = await fs.readFile(MIGRATION_PATH, "utf-8");
  const statements = migrationSql
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await client.unsafe(statement);
  }
}

export async function cleanDatabase(db: PostgresJsDatabase): Promise<void> {
  await db.execute(sql`TRUNCATE moves, products, users, categories CASCADE`);
}

export async function stopDatabase(testDb: TestDatabase): Promise<void> {
  await testDb.client.end();
  await testDb.container.stop();
}
