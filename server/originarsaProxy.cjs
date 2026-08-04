const DEFAULT_BASE_URL = "https://api-pre.originarsa.com/api";
const DEFAULT_USER = "crediexpress";
const DEFAULT_PASSWORD = "CCbnNIIUsuvyZM9dtiVWz494c2U8owTvEk9SRliW+UU/fR+d+mpy8lHHUuQWFg09nevS17oNwvUvBzMMZ2gZXLWpFDF35OFw6Y1aXJy9UH/UhLvsL1psO4R2K4ofY+RSf/Uh4Q2fmSZE+Ox9W0f+Bj9I0H48HSn33aDVDs4fRN8nidMO08mXOhUubI4Zdfswpl7itUcnpqkQCPtaQR/WUc4W0dC9kxVJeyWEU1HO97dh5oda2162XHENTkJk5Afo3KTNE1HFlpnkVNpnJevlfHBemsXs855Il7gpel/Ala4Iw6yfRj5aRvuXBv9K89QljA5dW7DWfl+nlrt0J7FyQ==";

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
  const token = await getAuthToken();
  const headers = {
    ...(options.headers || {}),
    "Authorization": `Bearer ${token}`,
  };

  const targetUrl = buildUpstreamUrl(pathname);
  let response = await fetch(targetUrl, {
    ...options,
    headers,
  });

  // Si recibimos 401 Unauthorized, forzamos refresco del token e intentamos una vez más
  if (response.status === 401) {
    console.warn("Token invalido o expirado upstream. Forzando re-autenticacion...");
    const freshToken = await getAuthToken(true);
    headers["Authorization"] = `Bearer ${freshToken}`;
    response = await fetch(targetUrl, {
      ...options,
      headers,
    });
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