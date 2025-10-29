// src/services/cedula.ts
// Servicio para consultar datos por cédula ecuatoriana desde el frontend.
// Maneja los distintos formatos que devuelve el webservice.

export interface CedulaResponse {
  nombres?: string;
  apellidos?: string;
  nombreCompleto?: string;
  [key: string]: any;
}

export async function getDatosPorCedula(cedula: string): Promise<CedulaResponse> {
  const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";
  const token = import.meta.env.VITE_API_TOKEN;

  if (!/^\d{10}$/.test(cedula)) {
    throw new Error("Número de cédula inválido");
  }

  if (!base || !token) {
    throw new Error("Configuración faltante: defina VITE_API_BASE_URL y VITE_API_TOKEN");
  }

  const url = `${base}/${cedula}`.replace(/([^:]\/)\/+/, "$1/");

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    throw new Error("La respuesta no contiene JSON válido");
  }

  if (!res.ok) {
    console.error("Error API cédula:", data);
    throw new Error(`Error ${res.status}: ${data?.error || res.statusText}`);
  }

    // 🧠 Normalización: detecta los formatos posibles de respuesta
  const payload =
    data.response || // formato actual (contiene los datos reales)
    data.data ||
    data.result ||
    data ||
    {};
  
  // 🔧 Combina los datos del payload en la raíz
  const nombres = payload.nombres ?? data.nombres ?? "";
  const apellidos = payload.apellidos ?? data.apellidos ?? "";
  const nombreCompleto =
    payload.nombreCompleto ??
    `${payload.apellidos ?? ""} ${payload.nombres ?? ""}`.trim();
  
  return {
    nombres,
    apellidos,
    nombreCompleto,
    ...payload,
  };
}

