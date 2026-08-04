const DEFAULT_BASE_URL = "https://api-pre.originarsa.com/api";
const DEFAULT_USER = "crediexpress";
const DEFAULT_PASSWORD = "yHti1+G6TTWT9cKC97LHHXaKKXf3rdKT7Tb78/KWFZHIL15netvunhmkfwelVig7UHeERVahrKhMCXfwulgu4Cfqx7aGLhIrtMd6I76mhMFgm3SpuJAYgFBw3gNTbmAlhYKIAh9CIx5vhbE4K+DOZRXTJ12udj2EhoqM5GHFOsIPKS280z2R1bS25tlsw3E4FrnOVjwc54p6GEMAZrBHr5OK58f8swyjkG2Nnbl/E1cfLvFCDJ3NyCqB9dIPUZrhRu8mKdf/am7hZlUhaExKqiDDh2DKnWAxdFJFXrdhKTLflufrZlvlVuBdcnneEgpmowoNAyVUsOt/HnUxNIZUGQ==";

let cachedToken = null;
let tokenExpirationMs = 0;

function resolveOriginarsaApiBaseUrl() {
  const configuredBaseUrl = process.env.ORIGINARSA_API_BASE_URL;
  return (configuredBaseUrl && configuredBaseUrl.trim()) || DEFAULT_BASE_URL;
}

function buildUpstreamUrl(pathname) {
  const baseUrl = resolveOriginarsaApiBaseUrl().replace(/\/+$/, "");
  const normalizedPath = String(pathname || "").replace(/^\/+/, "");
  return `${baseUrl}/${normalizedPath}`;
}

async function getAuthToken(forceRefresh = false) {
  // Si se configuró un token fijo en las variables de entorno de Vercel (ORIGINARSA_API_TOKEN), usarlo directamente
  const envToken = process.env.ORIGINARSA_API_TOKEN;
  if (envToken && envToken.trim()) {
    return envToken.trim();
  }

  const now = Date.now();
  // Si tenemos token en caché y aún le queda al menos 1 minuto de validez
  if (!forceRefresh && cachedToken && tokenExpirationMs > now + 60000) {
    return cachedToken;
  }

  const usuario = process.env.ORIGINARSA_API_USER || DEFAULT_USER;
  const contrasenaEncriptada = process.env.ORIGINARSA_API_PASSWORD || DEFAULT_PASSWORD;

  const loginUrl = buildUpstreamUrl("Autenticacion/login/aplicacion");
  
  const loginRes = await fetch(loginUrl, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      usuario,
      contrasenaEncriptada,
    }),
  });

  if (!loginRes.ok) {
    const errorText = await loginRes.text();
    throw new Error(`Fallo en autenticacion Originarsa API (${loginRes.status}): ${errorText}`);
  }

  const loginData = await loginRes.json();
  const tokenAcceso = loginData?.data?.tokenAcceso;
  const fechaExpiracion = loginData?.data?.fechaExpiracion;

  if (!tokenAcceso) {
    throw new Error("Respuesta de login invalida: no se recibio tokenAcceso");
  }

  cachedToken = tokenAcceso;
  if (fechaExpiracion) {
    tokenExpirationMs = new Date(fechaExpiracion).getTime();
  } else {
    // Si no viene fechaExpiracion, asumir validez de 1 hora
    tokenExpirationMs = now + 3600000;
  }

  return cachedToken;
}

async function fetchWithAuth(pathname, options = {}) {
  let token = null;
  try {
    token = await getAuthToken();
  } catch (err) {
    console.warn("No se pudo obtener token de autenticacion:", err.message);
  }

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const targetUrl = buildUpstreamUrl(pathname);
  let response = await fetch(targetUrl, {
    ...options,
    headers,
  });

  // Si recibimos 401 Unauthorized, intentamos forzar re-autenticación una vez si no usábamos token estático
  if (response.status === 401 && !process.env.ORIGINARSA_API_TOKEN) {
    console.warn("Token invalido o expirado upstream. Forzando re-autenticacion...");
    try {
      const freshToken = await getAuthToken(true);
      if (freshToken) {
        headers["Authorization"] = `Bearer ${freshToken}`;
        response = await fetch(targetUrl, {
          ...options,
          headers,
        });
      }
    } catch {
      // Ignorar fallo de re-autenticación
    }
  }

  return response;
}

async function sendUpstreamResponse(res, upstreamResponse) {
  const responseBody = await upstreamResponse.text();
  const contentType = upstreamResponse.headers.get("content-type");

  if (contentType) {
    res.setHeader("Content-Type", contentType);
  }

  res.status(upstreamResponse.status).send(responseBody);
}

function sendJson(res, statusCode, payload) {
  res.status(statusCode).json(payload);
}

module.exports = {
  buildUpstreamUrl,
  getAuthToken,
  fetchWithAuth,
  sendJson,
  sendUpstreamResponse,
};