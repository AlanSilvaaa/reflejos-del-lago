/* eslint-disable */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("frontend environment file", () => {
  it("includes a .env file", () => {
    expect(existsSync(resolve(process.cwd(), ".env"))).toBe(true);
  });
});
