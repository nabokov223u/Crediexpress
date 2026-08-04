const {
  buildUpstreamUrl,
  fetchWithAuth,
  sendJson,
  sendUpstreamResponse,
} = require("../../server/originarsaProxy.cjs");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method Not Allowed" });
  }

  try {
    const requestBody = typeof req.body === "string"
      ? req.body
      : JSON.stringify(req.body ?? {});

    const upstreamResponse = await fetchWithAuth(
      "Creditos/ObtenerCalificacionCreditoRapido",
      {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: requestBody,
      }
    );

    let rawData = null;
    try {
      rawData = await upstreamResponse.json();
    } catch {
      // No es JSON
    }

    if (!upstreamResponse.ok) {
      if (rawData && rawData.mensaje) {
        const msg = Array.isArray(rawData.mensaje) ? rawData.mensaje[0] : rawData.mensaje;
        return sendJson(res, 200, {
          data: null,
          mensaje: msg,
        });
      }
      return sendJson(res, upstreamResponse.status, {
        data: null,
        mensaje: {
          huboError: true,
          codigoRespuesta: upstreamResponse.status,
          mensajeRespuesta: "Error en el servicio de calificacion",
        },
      });
    }

    // Filtrar payload para evitar fugas de información
    const filteredData = {
      mensaje: rawData.mensaje || {
        huboError: false,
        codigoRespuesta: upstreamResponse.status,
        mensajeRespuesta: "OK"
      },
      data: rawData.data ? {
        calificacionCrediExpress: rawData.data.calificacionCrediExpress || "",
        motivoCalificacionCrediExpress: rawData.data.motivoCalificacionCrediExpress || ""
      } : null
    };

    return sendJson(res, 200, filteredData);
  } catch (error) {
    console.error("Proxy de calificacion fallo:", error);
    return sendJson(res, 502, {
      data: null,
      mensaje: {
        id: "proxy-calificacion-error",
        huboError: true,
        codigoRespuesta: 502,
        mensajeRespuesta: "No se pudo conectar con el servicio de calificacion",
      },
    });
  }
};