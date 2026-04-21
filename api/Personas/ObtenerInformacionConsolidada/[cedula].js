const {
  buildUpstreamUrl,
  sendJson,
  sendUpstreamResponse,
} = require("../../../server/originarsaProxy.cjs");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendJson(res, 405, { error: "Method Not Allowed" });
  }

  const cedula = Array.isArray(req.query.cedula) ? req.query.cedula[0] : req.query.cedula;

  if (!/^\d{10}$/.test(cedula || "")) {
    return sendJson(res, 400, {
      mensaje: {
        huboError: true,
        codigoRespuesta: 400,
        mensajeRespuesta: "Numero de cedula invalido",
      },
    });
  }

  const apiUser = process.env.CEDULA_API_USER;
  const apiPassword = process.env.CEDULA_API_PASSWORD;

  if (!apiUser || !apiPassword) {
    console.error("Faltan CEDULA_API_USER o CEDULA_API_PASSWORD en el entorno del servidor");
    return sendJson(res, 500, {
      mensaje: {
        huboError: true,
        codigoRespuesta: 500,
        mensajeRespuesta: "Credenciales del servicio no configuradas",
      },
    });
  }

  const authorization = `Basic ${Buffer.from(`${apiUser}:${apiPassword}`).toString("base64")}`;

  try {
    const upstreamResponse = await fetch(
      buildUpstreamUrl(`Personas/ObtenerInformacionConsolidada/${cedula}`),
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": authorization,
        },
      }
    );

    return sendUpstreamResponse(res, upstreamResponse);
  } catch (error) {
    console.error("Proxy de cedula fallo:", error);
    return sendJson(res, 502, {
      mensaje: {
        huboError: true,
        codigoRespuesta: 502,
        mensajeRespuesta: "No se pudo conectar con el servicio de cedula",
      },
    });
  }
};