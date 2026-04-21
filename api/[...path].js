// api/[...path].js
// Proxy serverless para reenviar /api/* → https://api-pre.originarsa.com/api/*
// Reemplaza el rewrite pasivo de vercel.json para tener control total sobre headers y errores.

const TARGET_BASE = 'https://api-pre.originarsa.com';

module.exports = async function handler(req, res) {
  // req.query.path es un array con los segmentos de la ruta
  const pathSegments = Array.isArray(req.query.path) ? req.query.path : [req.query.path];
  const targetPath = pathSegments.join('/');

  // Construir query string si hay parámetros adicionales
  const { path: _ignored, ...queryParams } = req.query;
  const queryString = new URLSearchParams(queryParams).toString();
  const targetUrl = `${TARGET_BASE}/api/${targetPath}${queryString ? `?${queryString}` : ''}`;

  console.log(`[proxy] ${req.method} ${req.url} → ${targetUrl}`);

  // Copiar solo los headers relevantes (evitar conflictos de host, encoding, etc.)
  const forwardHeaders = {
    'Content-Type': req.headers['content-type'] || 'application/json',
    'Accept': req.headers['accept'] || 'application/json',
  };

  // Reenviar authorization si viene del cliente
  if (req.headers['authorization']) {
    forwardHeaders['Authorization'] = req.headers['authorization'];
  }

  const fetchOptions = {
    method: req.method,
    headers: forwardHeaders,
  };

  // Adjuntar body para métodos que lo permiten
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    fetchOptions.body = req.body
      ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body))
      : undefined;
  }

  let upstream;
  try {
    upstream = await fetch(targetUrl, fetchOptions);
  } catch (err) {
    console.error('[proxy] Error de red hacia el backend:', err.message);
    return res.status(502).json({
      error: 'No se pudo conectar con el servicio externo.',
      detail: err.message,
    });
  }

  const contentType = upstream.headers.get('content-type') || 'application/json';
  const responseText = await upstream.text();

  console.log(`[proxy] Respuesta del backend: ${upstream.status} (${contentType})`);

  res.status(upstream.status);
  res.setHeader('Content-Type', contentType);
  res.send(responseText);
}
