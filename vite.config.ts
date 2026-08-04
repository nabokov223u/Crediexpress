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

const DEFAULT_USER = "crediexpress";
const DEFAULT_PASSWORD = "CCbnNIIUsuvyZM9dtiVWz494c2U8owTvEk9SRliW+UU/fR+d+mpy8lHHUuQWFg09nevS17oNwvUvBzMMZ2gZXLWpFDF35OFw6Y1aXJy9UH/UhLvsL1psO4R2K4ofY+RSf/Uh4Q2fmSZE+Ox9W0f+Bj9I0H48HSn33aDVDs4fRN8nidMO08mXOhUubI4Zdfswpl7itUcnpqkQCPtaQR/WUc4W0dC9kxVJeyWEU1HO97dh5oda2162XHENTkJk5Afo3KTNE1HFlpnkVNpnJevlfHBemsXs855Il7gpel/Ala4Iw6yfRj5aRvuXBv9K89QljA5dW7DWfl+nlrt0J7FyQ==";

let localCachedToken: string | null = null;
let localTokenExpirationMs = 0;

async function getLocalAuthToken(targetBase: string, usuario: string, contrasenaEncriptada: string): Promise<string> {
  const now = Date.now();
  if (localCachedToken && localTokenExpirationMs > now + 60000) {
    return localCachedToken;
  }

  const loginUrl = `${targetBase}/api/Autenticacion/login/aplicacion`;
  const res = await fetch(loginUrl, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ usuario, contrasenaEncriptada }),
  });

  if (!res.ok) {
    throw new Error(`Proxy local fallo al obtener token (${res.status})`);
  }

  const data = await res.json();
  const token = data?.data?.tokenAcceso;
  if (!token) throw new Error("No se recibio tokenAcceso en login local");

  localCachedToken = token;
  if (data?.data?.fechaExpiracion) {
    localTokenExpirationMs = new Date(data.data.fechaExpiracion).getTime();
  } else {
    localTokenExpirationMs = now + 3600000;
  }
  return localCachedToken;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const target = resolveOriginarsaProxyTarget(env.ORIGINARSA_API_BASE_URL);
  const usuario = env.ORIGINARSA_API_USER || env.CEDULA_API_USER || DEFAULT_USER;
  const contrasenaEncriptada = env.ORIGINARSA_API_PASSWORD || env.CEDULA_API_PASSWORD || DEFAULT_PASSWORD;

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on("proxyReq", async (proxyReq, req) => {
              if (req.url && req.url.includes("/Autenticacion/login")) return;

              try {
                const token = await getLocalAuthToken(target, usuario, contrasenaEncriptada);
                proxyReq.setHeader("Authorization", `Bearer ${token}`);
              } catch (err) {
                console.error("Error configurando header Authorization en proxy Vite:", err);
              }
            });
          },
        },
      },
    },
  };
});
