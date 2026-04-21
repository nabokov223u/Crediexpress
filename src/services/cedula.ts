// src/services/cedula.ts
// Servicio oficial de Originarsa para consultar datos por cédula

export interface CedulaResponse {
  nombres?: string;
  apellidos?: string;
  nombreCompleto?: string;
  [key: string]: any;
}

// En desarrollo local seguimos usando el proxy de Vite hacia Originarsa.
// En produccion la autenticacion la agrega la funcion serverless.
const DEV_API_USER = import.meta.env.DEV ? import.meta.env.VITE_CEDULA_API_USER : undefined;
const DEV_API_PASS = import.meta.env.DEV ? import.meta.env.VITE_CEDULA_API_PASSWORD : undefined;

export async function getDatosPorCedula(cedula: string): Promise<CedulaResponse> {
  // Validación básica de cédula
  if (!/^\d{10}$/.test(cedula)) throw new Error("Número de cédula inválido");

  if (import.meta.env.DEV && (!DEV_API_USER || !DEV_API_PASS)) {
    console.error("Faltan credenciales de API Cédula en .env");
    throw new Error("Error de configuración del servicio");
  }

  // En desarrollo: Vite proxya /api al upstream.
  // En produccion: Vercel resuelve /api con funciones serverless del proyecto.
  // Endpoint final: /api/Personas/ObtenerInformacionConsolidada/{cedula}
  const url = `/api/Personas/ObtenerInformacionConsolidada/${cedula}`;
  const headers: Record<string, string> = {
    "Accept": "application/json"
  };

  if (import.meta.env.DEV && DEV_API_USER && DEV_API_PASS) {
    headers.Authorization = `Basic ${btoa(`${DEV_API_USER}:${DEV_API_PASS}`)}`;
  }

  try {
    console.log(`🔍 Consultando datos para cédula: ${cedula}`);
    
    const res = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Error API Cédula:", errorText);
        throw new Error(`Error ${res.status}: No se pudo obtener información`);
    }

    const data = await res.json();
    console.log("📥 Datos recibidos:", data);

    // Validar respuesta exitosa según estructura del proveedor
    if (data.mensaje && data.mensaje.huboError) {
        throw new Error(data.mensaje.mensajeRespuesta || "Error en el servicio de datos");
    }

    // Extraer información personal
    const info = data.data?.persona?.informacionPersonal;

    if (!info) {
        throw new Error("No se encontraron datos personales para esta cédula");
    }

    // Mapear a nuestra estructura interna
    // BLINDAJE: Usamos || "" para asegurar que NUNCA retornemos null o undefined
    return {
        nombres: info.nombres || "",
        apellidos: `${info.apellidoPaterno || ''} ${info.apellidoMaterno || ''}`.trim(),
        nombreCompleto: info.nombreCompleto || `${info.nombres || ''} ${info.apellidoPaterno || ''} ${info.apellidoMaterno || ''}`.trim(),
        // Guardamos datos extra por si acaso
        genero: info.genero || "",
        fechaNacimiento: info.fechaNacimiento || "",
        nacionalidad: info.nacionalidad || "",
        estadoCivil: info.estadoCivil || ""
    };

  } catch (error) {
    console.error("Error fetching cedula:", error);
    // Re-lanzar para que la UI lo maneje
    throw error;
  }
}

