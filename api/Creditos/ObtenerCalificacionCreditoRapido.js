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
    let bodyObj = req.body;
    if (typeof bodyObj === "string") {
      try { bodyObj = JSON.parse(bodyObj); } catch { bodyObj = {}; }
    }
    bodyObj = bodyObj ?? {};

    // Mapear a PascalCase exacto esperado por el DTO de .NET (C#)
    const upstreamPayload = {
      CodigoTipoCotizador: bodyObj.codigoTipoCotizador || bodyObj.CodigoTipoCotizador || "COD_COT_001",
      Identificacion: bodyObj.identificacion || bodyObj.Identificacion || "",
      MontoVehiculo: Number(bodyObj.montoVehiculo ?? bodyObj.MontoVehiculo ?? 0),
      PorcentajeEntrada: Number(bodyObj.porcentajeEntrada ?? bodyObj.PorcentajeEntrada ?? 0),
      Plazo: String(bodyObj.plazo ?? bodyObj.Plazo ?? "48"),
      ValorEntrada: Number(bodyObj.valorEntrada ?? bodyObj.ValorEntrada ?? 0),
      ValorCuotaMensual: Number(bodyObj.valorCuotaMensual ?? bodyObj.ValorCuotaMensual ?? 0),
      MontoAFinanciar: Number(bodyObj.montoAFinanciar ?? bodyObj.MontoAFinanciar ?? 0),
      Ip: String(bodyObj.Ip || bodyObj.ip || "127.0.0.1")
    };

    const requestBody = JSON.stringify(upstreamPayload);

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