// src/services/cedula.ts
// Servicio robusto para consultar datos por cédula ecuatoriana
// Compatible con múltiples estructuras de respuesta del proveedor

export interface CedulaResponse {
  nombres?: string;
  apellidos?: string;
  nombreCompleto?: string;
  [key: string]: any;
}

export async function getDatosPorCedula(cedula: string): Promise<CedulaResponse> {
  const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";
  const token = import.meta.env.VITE_API_TOKEN;

  if (!/^\d{10}$/.test(cedula)) throw new Error("Número de cédula inválido");
  if (!base || !token) throw new Error("Configuración faltante: defina VITE_API_BASE_URL y VITE_API_TOKEN");

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

  // 🧠 Detección jerárquica — busca datos en varios niveles
  const payload =
    data?.data?.response || // caso actual
    data?.response ||
    data?.data ||
    data?.result ||
    data ||
    {};

  // 💡 Normaliza nombres y apellidos
  const nombres = payload.nombres ?? "";
  const apellidos = payload.apellidos ?? "";
  const nombreCompleto = payload.nombreCompleto ?? `${apellidos} ${nombres}`.trim();

  // 🔁 Devuelve objeto limpio y plano
  return {
    nombres,
    apellidos,
    nombreCompleto,
    ...payload,
  };
}

