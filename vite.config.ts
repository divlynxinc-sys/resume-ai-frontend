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
      // Pin the dev port. Google OAuth ("Authorized JavaScript origins") and the
      // backend CORS allowlist are both registered for http://localhost:5173.
      // Without strictPort, Vite silently falls back to 5174/5175 when 5173 is
      // busy (a leftover dev process, a second tab, hot-reload), and the new
      // origin is rejected by Google → "Google sign-in throws on local dev, but
      // works after restarting the server" (the restart frees 5173). strictPort
      // makes Vite fail loudly instead of drifting to a mismatched origin.
      port: 5173,
      strictPort: true,
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
