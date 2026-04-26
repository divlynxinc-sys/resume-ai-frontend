import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // loadEnv with prefix "" reads ALL keys (not just VITE_*) from .env files.
  const env = loadEnv(mode, process.cwd(), "");
  // Set BACKEND_URL in your .env file to switch backends.
  // Local:    BACKEND_URL=http://localhost:8010  (default)
  // Deployed: BACKEND_URL=https://resume-ai-backend-production-0380.up.railway.app
  const backendUrl = env.BACKEND_URL || "http://localhost:8010";

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: backendUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
          secure: false,
        },
      },
    },
  };
});
