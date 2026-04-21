const {
  buildUpstreamUrl,
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

    const upstreamResponse = await fetch(
      buildUpstreamUrl("Creditos/ObtenerCalificacionCreditoRapido"),
      {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: requestBody,
      }
    );

    return sendUpstreamResponse(res, upstreamResponse);
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