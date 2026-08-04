const {
  buildUpstreamUrl,
  fetchWithAuth,
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

  try {
    const upstreamResponse = await fetchWithAuth(
      `Personas/ObtenerInformacionConsolidada/${cedula}`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      }
    );

    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text();
      return res.status(upstreamResponse.status).send(errorText);
    }

    const rawData = await upstreamResponse.json();
    
    // Filtrar payload para evitar fugas de información
    const info = rawData.data?.persona?.informacionPersonal;
    const filteredData = {
      mensaje: rawData.mensaje || {
        huboError: false,
        codigoRespuesta: upstreamResponse.status,
        mensajeRespuesta: "OK"
      },
      data: info ? {
        persona: {
          informacionPersonal: {
            nombres: info.nombres || "",
            apellidoPaterno: info.apellidoPaterno || "",
            apellidoMaterno: info.apellidoMaterno || "",
            nombreCompleto: info.nombreCompleto || "",
            genero: info.genero || "",
            fechaNacimiento: info.fechaNacimiento || "",
            nacionalidad: info.nacionalidad || "",
            estadoCivil: info.estadoCivil || ""
          }
        }
      } : null
    };

    return sendJson(res, 200, filteredData);
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