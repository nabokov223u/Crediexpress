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
    let upstreamResponse;
    try {
      upstreamResponse = await fetchWithAuth(
        `Personas/ObtenerInformacionConsolidada/${cedula}`,
        {
          method: "GET",
          headers: { "Accept": "application/json" },
        }
      );
    } catch {
      // Fallback a fetch directo sin token (el endpoint de cédula es público en PRE)
      upstreamResponse = await fetch(
        buildUpstreamUrl(`Personas/ObtenerInformacionConsolidada/${cedula}`),
        {
          method: "GET",
          headers: { "Accept": "application/json" },
        }
      );
    }

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
          mensajeRespuesta: "Error en el servicio de cedula",
        },
      });
    }
    
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