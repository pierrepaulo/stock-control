import { vi } from "vitest";

process.env.NODE_ENV = "test";
process.env.BASE_URL = "http://localhost:3001";
process.env.PORT = "0";

vi.spyOn(console, "log").mockImplementation(() => {});
vi.spyOn(console, "error").mockImplementation(() => {});
