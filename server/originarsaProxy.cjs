const DEFAULT_BASE_URL = "https://api-pre.originarsa.com/api";

function resolveOriginarsaApiBaseUrl() {
  const configuredBaseUrl = process.env.ORIGINARSA_API_BASE_URL;
  return (configuredBaseUrl && configuredBaseUrl.trim()) || DEFAULT_BASE_URL;
}

function buildUpstreamUrl(pathname) {
  const baseUrl = resolveOriginarsaApiBaseUrl().replace(/\/+$/, "");
  const normalizedPath = String(pathname || "").replace(/^\/+/, "");
  return `${baseUrl}/${normalizedPath}`;
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
  sendJson,
  sendUpstreamResponse,
};