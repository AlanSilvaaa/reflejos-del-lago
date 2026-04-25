/* eslint-disable */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("frontend environment template", () => {
  it("includes an env.example file", () => {
    expect(existsSync(resolve(process.cwd(), "env.example"))).toBe(true);
  });

  it("documents the required Vite environment variables", () => {
    const envExample = readFileSync(resolve(process.cwd(), "env.example"), "utf8");

    expect(envExample).toContain("VITE_GOOGLE_MAPS_API_KEY=");
    expect(envExample).toContain("VITE_GOOGLE_MAP_ID=");
  });
});
