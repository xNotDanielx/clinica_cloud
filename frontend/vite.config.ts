import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  preview: { proxy: { "/api": { target: "http://backend:8000", changeOrigin: true, rewrite: (path) => path.replace(/^\/api/, "") } } },
  server: {
    host: "0.0.0.0",
    proxy: { "/api": { target: process.env.API_PROXY_TARGET || "http://backend:8000", changeOrigin: true, rewrite: (path) => path.replace(/^\/api/, "") } },
    port: 5173,
    watch: {
      usePolling: true
    }
  }
});
