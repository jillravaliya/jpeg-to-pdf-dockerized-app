// ✅ vite.config.mjs — Final version
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./", // 👈 FIX: use relative paths for Nginx
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: "dist",
  },
});