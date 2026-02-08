import { describe, it, expect, vi, beforeEach } from "vitest";
import path from "path";

const mockMkdir = vi.fn().mockResolvedValue(undefined);
const mockUnlink = vi.fn().mockResolvedValue(undefined);
const mockToFile = vi.fn().mockResolvedValue(undefined);
const mockResize = vi.fn().mockReturnValue({ toFile: mockToFile });
const mockSharp = vi.fn().mockReturnValue({ resize: mockResize });

vi.mock("fs/promises", () => ({
  default: {
    mkdir: (...args: any[]) => mockMkdir(...args),
    unlink: (...args: any[]) => mockUnlink(...args),
  },
}));

vi.mock("sharp", () => ({
  default: (...args: any[]) => mockSharp(...args),
}));

const { saveAvatar, deleteAvatar } = await import(
  "../../../src/services/file.service.js"
);

describe("saveAvatar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama sharp resize 50x50 cover/center e cria diretorio", async () => {
    const buffer = Buffer.from("fake-image");

    await saveAvatar(buffer, "photo.jpg");

    expect(mockMkdir).toHaveBeenCalledWith(expect.stringContaining("avatars"), {
      recursive: true,
    });
    expect(mockSharp).toHaveBeenCalledWith(buffer);
    expect(mockResize).toHaveBeenCalledWith(50, 50, {
      fit: "cover",
      position: "center",
    });
  });

  it("gera filename com timestamp e escreve no path correto", async () => {
    const buffer = Buffer.from("fake-image");
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);

    const result = await saveAvatar(buffer, "photo.jpg");

    expect(result).toBe(`${now}.jpg`);
    expect(mockToFile).toHaveBeenCalledWith(
      expect.stringContaining(`${now}.jpg`),
    );

    vi.restoreAllMocks();
  });
});

describe("deleteAvatar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("chama fs.unlink com path correto", async () => {
    await deleteAvatar("1234567890.jpg");

    expect(mockUnlink).toHaveBeenCalledWith(
      expect.stringContaining(path.join("avatars", "1234567890.jpg")),
    );
  });

  it("nao faz nada se fileName e falsy", async () => {
    await deleteAvatar("");

    expect(mockUnlink).not.toHaveBeenCalled();
  });
});
