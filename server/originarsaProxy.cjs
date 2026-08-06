const crypto = require("crypto");

const DEFAULT_BASE_URL = "https://api-pre.originarsa.com/api";
const DEFAULT_USER = "crediexpress";

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

// Cifra una contraseña en texto plano con la llave pública RSA de Originarsa
// (RSA-OAEP + SHA-256), replicando el <script> que entregó tecnología pero en
// Node. La llave pública se obtiene en vivo para tolerar rotaciones.
async function encryptPassword(plainPassword) {
  const pkRes = await fetch(buildUpstreamUrl("Autenticacion/public-key"), {
    headers: { Accept: "application/json" },
  });
  if (!pkRes.ok) {
    throw new Error(`No se pudo obtener la llave pública (${pkRes.status})`);
  }
  const { publicKey } = await pkRes.json();
  if (!publicKey) {
    throw new Error("La respuesta de public-key no incluye 'publicKey'");
  }

  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(plainPassword, "utf8")
  );
  return encrypted.toString("base64");
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

  // Dos formas de entregar la credencial:
  //  - ORIGINARSA_API_PASSWORD_PLAIN: contraseña en texto plano (se cifra aquí en
  //    cada login). Es lo más robusto: nunca se corrompe al copiar/pegar.
  //  - ORIGINARSA_API_PASSWORD: la contraseña ya cifrada (contrasenaEncriptada).
  //    Debe llegar intacta byte a byte; un solo carácter cambiado la invalida.
  const plainPassword = process.env.ORIGINARSA_API_PASSWORD_PLAIN;
  let contrasenaEncriptada = process.env.ORIGINARSA_API_PASSWORD;

  if (plainPassword && plainPassword.trim()) {
    contrasenaEncriptada = await encryptPassword(plainPassword.trim());
  }

  if (!contrasenaEncriptada || !contrasenaEncriptada.trim()) {
    throw new Error(
      "Falta credencial: configure ORIGINARSA_API_PASSWORD_PLAIN o ORIGINARSA_API_PASSWORD"
    );
  }

  // Endpoint oficial para autenticación de aplicación (usuario crediexpress)
  const loginUrl = buildUpstreamUrl("Autenticacion/login/aplicacion");
  const loginRes = await fetch(loginUrl, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      usuario,
      contrasenaEncriptada: contrasenaEncriptada.trim(),
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
    const msg = loginData?.mensaje?.mensajeRespuesta || "No se recibio tokenAcceso";
    throw new Error(`Respuesta de login invalida: ${msg}`);
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