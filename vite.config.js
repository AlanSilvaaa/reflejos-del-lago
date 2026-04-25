import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import { execSync } from "node:child_process";
import packageJson from "./package.json" with { type: "json" };

function getReleaseDate() {
  try {
    return execSync("git log -1 --format=%cs", { encoding: "utf8" }).trim();
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  base: mode === "production" ? "/Reflejos-del-lago/" : "/",
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __APP_RELEASE_DATE__: JSON.stringify(getReleaseDate()),
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
  },
}));
