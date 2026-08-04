// src/services/cedula.ts
// Servicio oficial de Originarsa para consultar datos por cédula

export interface CedulaResponse {
  nombres?: string;
  apellidos?: string;
  nombreCompleto?: string;
  [key: string]: any;
}

export async function getDatosPorCedula(cedula: string): Promise<CedulaResponse> {
  if (!/^\d{10}$/.test(cedula)) throw new Error("Número de cédula inválido");

  // En desarrollo local: Vite proxya /api al upstream.
  // En produccion Vercel: /api se resuelve con Serverless Functions.
  const envUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();
  const apiBase = (!envUrl || envUrl.includes("webservices.ec")) ? "" : envUrl.replace(/\/+$/, "");
  const url = `${apiBase}/api/Personas/ObtenerInformacionConsolidada/${cedula}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Error ${res.status}: No se pudo obtener información`);
    }

    const data = await res.json();

    if (data.mensaje?.huboError) {
      throw new Error(data.mensaje.mensajeRespuesta || "Error en el servicio de datos");
    }

    const info = data.data?.persona?.informacionPersonal;

    if (!info) {
      throw new Error("No se encontraron datos personales para esta cédula");
    }

    return {
      nombres: info.nombres || "",
      apellidos: `${info.apellidoPaterno || ""} ${info.apellidoMaterno || ""}`.trim(),
      nombreCompleto:
        info.nombreCompleto ||
        `${info.nombres || ""} ${info.apellidoPaterno || ""} ${info.apellidoMaterno || ""}`.trim(),
      genero: info.genero || "",
      fechaNacimiento: info.fechaNacimiento || "",
      nacionalidad: info.nacionalidad || "",
      estadoCivil: info.estadoCivil || "",
    };
  } catch (error) {
    throw error;
  }
}
