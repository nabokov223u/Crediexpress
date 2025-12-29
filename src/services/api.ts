import type { FormData } from "../context/FormContext";
import { savePrequalificationToFirebase, type PrequalificationResult } from "./firebase";
import { monthlyPayment } from "./calculator";

// Constante fija del sistema
const CODIGO_COTIZADOR = "COD_COT_001";

// Endpoint del calificador (Usando Proxy para evitar CORS)
// En local: vite.config.ts redirige /api -> https://api-pre.originarsa.com/api
// En prod: vercel.json redirige /api -> https://api-pre.originarsa.com/api
const API_ENDPOINT = "/api/Creditos/ObtenerCalificacionCreditoRapido";

// Tipos para la integración con el calificador
interface CalificadorRequest {
  codigoTipoCotizador: string;
  identificacion: string;
  montoVehiculo: number;
  porcentajeEntrada: number;
  plazo: string;
  valorEntrada: number;
  valorCuotaMensual: number;
  montoAFinanciar: number;
  Ip: string;
}

interface CalificadorResponse {
  data: {
    calificacionCrediExpress: string;
    motivoCalificacionCrediExpress: string;
  };
  mensaje: Array<{
    id: string;
    huboError: boolean;
    codigoRespuesta: number;
    mensajeRespuesta: string;
  }>;
}

// Mapear FormData al formato que espera el calificador
function mapFormDataToRequest(formData: FormData, ip: string): CalificadorRequest {
  const { loan } = formData;
  const valorEntrada = Math.round(loan.vehicleAmount * loan.downPaymentPct);
  const montoAFinanciar = loan.vehicleAmount - valorEntrada;
  const valorCuotaMensual = Math.round(monthlyPayment(montoAFinanciar, loan.termMonths));
  
  return {
    codigoTipoCotizador: CODIGO_COTIZADOR,
    identificacion: formData.applicant.idNumber,
    montoVehiculo: loan.vehicleAmount,
    porcentajeEntrada: Math.round(loan.downPaymentPct * 100), // Convertir 0.30 → 30
    plazo: loan.termMonths.toString(),
    valorEntrada,
    valorCuotaMensual,
    montoAFinanciar,
    Ip: ip
  };
}

// Obtener IP del cliente
async function getClientIp(): Promise<string> {
  // Retornamos IP estática para evitar problemas de bloqueo o timeout en Vercel
  return '127.0.0.1';
}

// Mapear respuesta del calificador a nuestros estados
function mapResponseToStatus(calificacion: string): 'approved' | 'review' | 'denied' {
  const upperCalificacion = calificacion.toUpperCase();
  
  if (upperCalificacion.includes('APROBADO')) return 'approved';
  if (upperCalificacion.includes('REVISION')) return 'review';
  if (upperCalificacion.includes('NEGADO') || upperCalificacion.includes('NOCALIFICA')) return 'denied';
  
  // Default a review si no reconocemos el estado
  console.warn('Estado de calificación no reconocido:', calificacion);
  return 'review';
}

export async function submitPrequalification(payload: FormData): Promise<PrequalificationResult & { id?: string }> {
  try {
    // Obtener IP
    const ip = await getClientIp();

    // Preparar el request
    const requestBody = mapFormDataToRequest(payload, ip);
    
    console.log('📤 Enviando solicitud al calificador:');
    console.log('URL:', API_ENDPOINT);
    console.log('Body:', requestBody);
    
    // Llamar al API del calificador
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('📡 Status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error del servidor:', errorText);
      throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
    }
    
    const data: CalificadorResponse = await response.json();
    
    console.log('📥 Respuesta del calificador:', data);
    
    // Validar respuesta
    if (data.mensaje?.[0]?.huboError) {
      throw new Error(data.mensaje[0].mensajeRespuesta || 'Error en la calificación');
    }
    
    // Mapear el estado
    const status = mapResponseToStatus(data.data.calificacionCrediExpress);
    
    const result: PrequalificationResult = { status };
    
    try {
      // Guardar en Firebase
      const applicationId = await savePrequalificationToFirebase(payload, result);
      
      return {
        ...result,
        id: applicationId
      };
    } catch (error) {
      console.error('⚠️ Error guardando en Firebase, continuando sin persistir:', error);
      return result;
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    // Detectar si es error de CORS
    if (errorMessage.includes('fetch') || errorMessage.includes('CORS') || errorMessage.includes('Failed to fetch')) {
      console.error('🚫 Error de CORS detectado - El servidor no permite peticiones desde este origen');
      console.warn('💡 Solución: El equipo de backend debe configurar CORS en api-pre.originarsa.com');
      console.warn('   Headers necesarios:');
      console.warn('   - Access-Control-Allow-Origin: * (o tu dominio específico)');
      console.warn('   - Access-Control-Allow-Methods: POST, OPTIONS');
      console.warn('   - Access-Control-Allow-Headers: Content-Type, Accept');
    } else {
      console.error('❌ Error en la calificación de crédito:', errorMessage);
    }
    
    // En caso de error, usar lógica fallback (la original)
    console.warn('🔄 Usando lógica de calificación local como fallback');
    console.info('ℹ️ La aplicación sigue funcionando normalmente con calificación local');
    
    const financed = payload.loan.vehicleAmount * (1 - payload.loan.downPaymentPct);
    let status: 'approved' | 'review' | 'denied';
    
    if (financed <= 16000 && payload.loan.termMonths <= 60) {
      status = "approved";
    } else if (financed <= 25000) {
      status = "review";
    } else {
      status = "denied";
    }
    
    const result: PrequalificationResult = { status };
    
    try {
      const applicationId = await savePrequalificationToFirebase(payload, result);
      return { ...result, id: applicationId };
    } catch (fbError) {
      console.error('⚠️ Error guardando en Firebase:', fbError);
      return result;
    }
  }
}
