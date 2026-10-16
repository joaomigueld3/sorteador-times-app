import { describe, it, expect, beforeEach, afterEach } from "vitest";
import clientPromiseProxy, { getDb, getClientPromise } from "../mongodb";

describe("mongodb lazy connection", () => {
  const originalMongoUri = process.env.MONGO_URI;
  const originalMongoDbUri = process.env.MONGODB_URI;

  beforeEach(() => {
    delete process.env.MONGO_URI;
    delete process.env.MONGODB_URI;
  });

  afterEach(() => {
    if (originalMongoUri !== undefined) process.env.MONGO_URI = originalMongoUri;
    if (originalMongoDbUri !== undefined) process.env.MONGODB_URI = originalMongoDbUri;
  });

  it("should not throw on module import when env vars are missing", () => {
    expect(clientPromiseProxy).toBeDefined();
    expect(typeof getDb).toBe("function");
    expect(typeof getClientPromise).toBe("function");
  });

  it("should throw a clear error when getDb is called without env vars", async () => {
    await expect(getDb()).rejects.toThrow(
      "Por favor defina a variável de ambiente MONGODB_URI (ou MONGO_URI) nas configurações do projeto."
    );
  });
});
