import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Standalone viewer for the reference wireframe. It is not part of the application build.
export default defineConfig({
  root: "references",
  plugins: [react()],
  server: { host: "127.0.0.1", port: 5174 },
  build: { outDir: "../.wireframe-dist", emptyOutDir: true },
});
