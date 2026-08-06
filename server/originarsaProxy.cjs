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

// Ejecuta el paso 3 del proceso: POST /Autenticacion/login/aplicacion con un
// contrasenaEncriptada dado. Devuelve { tokenAcceso, fechaExpiracion } o lanza.
async function loginWithCiphertext(usuario, contrasenaEncriptada) {
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

  const loginData = await loginRes.json().catch(() => null);
  const tokenAcceso = loginData?.data?.tokenAcceso;

  if (!loginRes.ok || !tokenAcceso) {
    const msg = loginData?.mensaje?.mensajeRespuesta || `HTTP ${loginRes.status}`;
    throw new Error(msg);
  }

  return { tokenAcceso, fechaExpiracion: loginData?.data?.fechaExpiracion };
}

function cacheToken(tokenAcceso, fechaExpiracion, now) {
  cachedToken = tokenAcceso;
  // Si no viene fechaExpiracion, asumir validez de 1 hora
  tokenExpirationMs = fechaExpiracion ? new Date(fechaExpiracion).getTime() : now + 3600000;
  return cachedToken;
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

  // Dos formas de entregar la credencial, en orden de preferencia:
  //  1) ORIGINARSA_API_PASSWORD_PLAIN: contraseña en texto plano. En cada login
  //     se hace el proceso completo (traer llave pública vigente + cifrar + login).
  //     Es auto-reparable: si rotan la llave, el siguiente login la trae fresca.
  //  2) ORIGINARSA_API_PASSWORD: la contraseña ya cifrada (contrasenaEncriptada),
  //     como respaldo. Funciona mientras no roten la llave y llegue intacta.
  const plainPassword = (process.env.ORIGINARSA_API_PASSWORD_PLAIN || "").trim();
  const storedCiphertext = (process.env.ORIGINARSA_API_PASSWORD || "").trim();

  if (!plainPassword && !storedCiphertext) {
    throw new Error(
      "Falta credencial: configure ORIGINARSA_API_PASSWORD_PLAIN o ORIGINARSA_API_PASSWORD"
    );
  }

  const errors = [];

  // 1) Texto plano -> ciframos contra la llave pública vigente y hacemos login
  if (plainPassword) {
    try {
      const contrasenaEncriptada = await encryptPassword(plainPassword);
      const { tokenAcceso, fechaExpiracion } = await loginWithCiphertext(usuario, contrasenaEncriptada);
      return cacheToken(tokenAcceso, fechaExpiracion, now);
    } catch (err) {
      errors.push(`texto-plano: ${err.message}`);
      console.warn("Login con contraseña en texto plano falló:", err.message);
    }
  }

  // 2) Respaldo: ciphertext pre-generado almacenado en la variable de entorno
  if (storedCiphertext) {
    try {
      const { tokenAcceso, fechaExpiracion } = await loginWithCiphertext(usuario, storedCiphertext);
      return cacheToken(tokenAcceso, fechaExpiracion, now);
    } catch (err) {
      errors.push(`ciphertext: ${err.message}`);
      console.warn("Login con ciphertext almacenado falló:", err.message);
    }
  }

  throw new Error(`Fallo en autenticacion Originarsa API (${errors.join(" | ")})`);
}

async function fetchWithAuth(pathname, options = {}) {
  const usingStaticToken = !!(process.env.ORIGINARSA_API_TOKEN && process.env.ORIGINARSA_API_TOKEN.trim());
  const targetUrl = buildUpstreamUrl(pathname);

  async function attempt(forceRefresh) {
    let token = null;
    try {
      token = await getAuthToken(forceRefresh);
    } catch (err) {
      console.warn("No se pudo obtener token de autenticacion:", err.message);
    }

    const headers = { ...(options.headers || {}) };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(targetUrl, { ...options, headers });
    return { response, hadToken: !!token };
  }

  let { response, hadToken } = await attempt(false);

  // Auto-reparación: si la autenticación falló (no obtuvimos token, o el upstream
  // rechazó con 401/403), forzamos el proceso completo de re-login (traer llave +
  // cifrar + login) y reintentamos la petición una sola vez.
  const authFailed = !hadToken || response.status === 401 || response.status === 403;
  if (authFailed && !usingStaticToken) {
    console.warn("Fallo de autenticación detectado. Re-autenticando y reintentando...");
    ({ response } = await attempt(true));
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