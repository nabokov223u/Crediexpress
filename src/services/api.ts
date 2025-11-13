import type { FormData } from "../context/FormContext";
import { savePrequalificationToFirebase, type PrequalificationResult } from "./firebase";
import { monthlyPayment } from "./calculator";

// Constante fija del sistema
const CODIGO_COTIZADOR = "COD_COT_001";

// Endpoint del calificador
const API_ENDPOINT = "https://api-pre.originarsa.com/api/Creditos/ObtenerCalificacionCreditoRapido";

// Tipos para la integración con el calificador
interface CalificadorRequest {
  codigoTipoCotizador: string;
  identificacion: string;
  montoVehiculo: number;
  porcentajeEntrada: number;
  plazo: number;
  valorEntrada: number;
  valorCuotaMensual: number;
  montoAFinanciar: number;
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
function mapFormDataToRequest(formData: FormData): CalificadorRequest {
  const { loan } = formData;
  const valorEntrada = Math.round(loan.vehicleAmount * loan.downPaymentPct);
  const montoAFinanciar = loan.vehicleAmount - valorEntrada;
  const valorCuotaMensual = Math.round(monthlyPayment(montoAFinanciar, loan.termMonths));
  
  return {
    codigoTipoCotizador: CODIGO_COTIZADOR,
    identificacion: formData.applicant.idNumber,
    montoVehiculo: loan.vehicleAmount,
    porcentajeEntrada: Math.round(loan.downPaymentPct * 100), // Convertir 0.30 → 30
    plazo: loan.termMonths,
    valorEntrada,
    valorCuotaMensual,
    montoAFinanciar,
  };
}

// Mapear respuesta del calificador a nuestros estados
function mapResponseToStatus(calificacion: string): 'approved' | 'review' | 'denied' {
  const upperCalificacion = calificacion.toUpperCase();
  
  if (upperCalificacion.includes('APROBADO')) return 'approved';
  if (upperCalificacion.includes('REVISION')) return 'review';
  if (upperCalificacion.includes('NEGADO')) return 'denied';
  
  // Default a review si no reconocemos el estado
  console.warn('Estado de calificación no reconocido:', calificacion);
  return 'review';
}

export async function submitPrequalification(payload: FormData): Promise<PrequalificationResult & { id?: string }> {
  try {
    // Preparar el request
    const requestBody = mapFormDataToRequest(payload);
    
    console.log('📤 Enviando solicitud al calificador:', requestBody);
    
    // Llamar al API del calificador
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
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
    console.error('❌ Error en la calificación de crédito:', error);
    
    // En caso de error, usar lógica fallback (la original)
    console.warn('🔄 Usando lógica de calificación local como fallback');
    
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
