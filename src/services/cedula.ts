// src/services/cedula.ts
// Servicio para consultar datos por cédula ecuatoriana desde el frontend.
// Usa variables de entorno Vite: VITE_API_BASE_URL y VITE_API_TOKEN
export interface CedulaResponse {
  nombres?: string;
  apellidos?: string;
  [key: string]: any;
}

export async function getDatosPorCedula(cedula: string): Promise<CedulaResponse> {
  const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '';
  const token = import.meta.env.VITE_API_TOKEN;

  if (!/^\d{10}$/.test(cedula)) {
    throw new Error("Número de cédula inválido");
  }

  if (!base || !token) {
    throw new Error("Configuración faltante: defina VITE_API_BASE_URL y VITE_API_TOKEN");
  }

  const url = `${base}/${cedula}`.replace(/([^:]\/)\/+/, "$1/");

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Error ${response.status}: ${response.statusText} ${text}`.trim());
  }

  return await response.json();
}
