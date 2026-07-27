// @ts-nocheck
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    conditions: ["browser"],
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src") },
    ],
  },
  optimizeDeps: {
    exclude: ["firebase"],
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./tests/setup.ts",
    css: true,
  },
});
