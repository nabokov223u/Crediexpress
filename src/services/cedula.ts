// src/services/cedula.ts
// Servicio oficial de Originarsa para consultar datos por cédula

export interface CedulaResponse {
  nombres?: string;
  apellidos?: string;
  nombreCompleto?: string;
  [key: string]: any;
}

// Credenciales del servicio (Hardcoded por solicitud explícita)
const API_USER = "IVRClaro";
const API_PASS = "1vRcl@r0r1G2024";

export async function getDatosPorCedula(cedula: string): Promise<CedulaResponse> {
  // Validación básica de cédula
  if (!/^\d{10}$/.test(cedula)) throw new Error("Número de cédula inválido");

  // Usamos el proxy existente /api que apunta a https://api-pre.originarsa.com/api
  // Endpoint final: /api/Personas/ObtenerInformacionConsolidada/{cedula}
  const url = `/api/Personas/ObtenerInformacionConsolidada/${cedula}`;

  // Generar header de autenticación Basic
  const auth = btoa(`${API_USER}:${API_PASS}`);

  try {
    console.log(`🔍 Consultando datos para cédula: ${cedula}`);
    
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Accept": "application/json"
      }
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
    return {
        nombres: info.nombres,
        apellidos: `${info.apellidoPaterno || ''} ${info.apellidoMaterno || ''}`.trim(),
        nombreCompleto: info.nombreCompleto,
        // Guardamos datos extra por si acaso
        genero: info.genero,
        fechaNacimiento: info.fechaNacimiento,
        nacionalidad: info.nacionalidad,
        estadoCivil: info.estadoCivil
    };

  } catch (error) {
    console.error("Error fetching cedula:", error);
    // Re-lanzar para que la UI lo maneje
    throw error;
  }
}

