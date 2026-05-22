import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

function resolveOriginarsaProxyTarget(baseUrl?: string) {
  const configured = (baseUrl || "").trim();
  if (!configured) return "https://api-pre.originarsa.com";

  try {
    const parsed = new URL(configured);
    return parsed.origin;
  } catch {
    return "https://api-pre.originarsa.com";
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const apiUser = env.CEDULA_API_USER || env.VITE_CEDULA_API_USER;
  const apiPassword = env.CEDULA_API_PASSWORD || env.VITE_CEDULA_API_PASSWORD;

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: resolveOriginarsaProxyTarget(env.ORIGINARSA_API_BASE_URL),
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            if (!apiUser || !apiPassword) return;

            proxy.on("proxyReq", (proxyReq) => {
              const token = Buffer.from(`${apiUser}:${apiPassword}`).toString("base64");
              proxyReq.setHeader("Authorization", `Basic ${token}`);
            });
          },
        },
      },
    },
  };
});
