import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    conditions: ["browser"],
    alias: [{ find: "@", replacement: path.resolve(__dirname, "./src") }],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom") || id.includes("node_modules/react-router-dom")) return "vendor";
          if (id.includes("node_modules/firebase") || id.includes("node_modules/@aws-sdk/client-ses")) return "libs";
        },
      },
    },
  },
});
