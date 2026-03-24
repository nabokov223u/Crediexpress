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

interface MensajeItem {
  id: string;
  huboError: boolean;
  codigoRespuesta: number;
  mensajeRespuesta: string;
}

interface CalificadorResponse {
  data: {
    calificacionCrediExpress: string;
    motivoCalificacionCrediExpress: string;
  } | null;
  mensaje: MensajeItem | MensajeItem[];
}

// Extraer el primer mensaje sin importar si viene como objeto o array
function extractMensaje(mensaje: MensajeItem | MensajeItem[]): MensajeItem | undefined {
  if (Array.isArray(mensaje)) return mensaje[0];
  return mensaje;
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
  if (!calificacion) return 'review'; // Protección contra nulos/vacíos

  const upperCalificacion = calificacion.toUpperCase();
  
  if (upperCalificacion.includes('APROBADO') || upperCalificacion.includes('CLIENTEPRECALIFICADO_OK')) return 'approved';
  if (upperCalificacion.includes('REVISION')) return 'review';
  if (upperCalificacion.includes('NEGADO') || upperCalificacion.includes('NOCALIFICA')) return 'denied';
  
  // Default a review si no reconocemos el estado
  console.warn('Estado de calificación no reconocido:', calificacion);
  return 'review';
}

// Llamar al endpoint del calificador y parsear la respuesta
async function callCalificador(requestBody: CalificadorRequest): Promise<CalificadorResponse> {
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
    let errorData: CalificadorResponse | null = null;
    try {
      errorData = await response.json();
    } catch {
      // No es JSON válido, ignorar
    }

    if (errorData) {
      console.warn('⚠️ El servidor retornó un error controlado:', errorData);
      const msg = extractMensaje(errorData.mensaje as MensajeItem | MensajeItem[]);
      throw new Error(msg?.mensajeRespuesta || `Error del servidor (${response.status})`);
    }
    throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Reintentar la llamada al calificador ante errores de servidor
const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 2000;

async function callCalificadorWithRetry(requestBody: CalificadorRequest): Promise<CalificadorResponse> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`🔄 Reintentando calificación (intento ${attempt + 1}/${MAX_RETRIES + 1})...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      }
      return await callCalificador(requestBody);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Error desconocido');

      // Solo reintentar errores de servidor genéricos, no errores de negocio
      const isServerError = lastError.message.includes('error en el servicio')
        || lastError.message.includes('Error HTTP')
        || lastError.message.includes('Failed to fetch');

      if (!isServerError || attempt >= MAX_RETRIES) {
        throw lastError;
      }
      console.warn(`⚠️ Error en intento ${attempt + 1}: ${lastError.message}. Reintentando...`);
    }
  }

  throw lastError!;
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
    console.table({
      cedula: requestBody.identificacion,
      vehiculo: `$${requestBody.montoVehiculo}`,
      entrada: `${requestBody.porcentajeEntrada}% ($${requestBody.valorEntrada})`,
      financiar: `$${requestBody.montoAFinanciar}`,
      plazo: `${requestBody.plazo} meses`,
      cuota: `$${requestBody.valorCuotaMensual}`,
    });
    
    // Llamar al API con reintentos
    const data = await callCalificadorWithRetry(requestBody);
    
    console.log('📥 Respuesta del calificador:', data);
    
    // Extraer mensaje unificado (objeto o array)
    const msg = extractMensaje(data.mensaje);

    // Validar si el servicio reportó error
    if (msg?.huboError) {
      console.warn('⚠️ El servicio reportó error:', msg.mensajeRespuesta, '| Código:', msg.codigoRespuesta);
      throw new Error(msg.mensajeRespuesta || 'Error en la calificación');
    }

    // Validación de seguridad contra data null
    if (!data.data) {
        console.warn('⚠️ La API respondió OK pero sin datos de calificación (data is null). Activando fallback.');
        throw new Error('Respuesta de API incompleta: data is null');
    }
    
    // Mapear el estado
    const status = mapResponseToStatus(data.data.calificacionCrediExpress || '');
    console.log('✅ Calificación obtenida:', data.data.calificacionCrediExpress, '→', status);
    
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
    } else {
      console.error('❌ Error en la calificación de crédito:', errorMessage);
    }
    
    // En caso de error, forzamos el estado a "review" para que un asesor lo gestione manualmente
    console.warn('🔄 Fallback activado: Redirigiendo a revisión manual por error en servicio.');
    
    const status: 'approved' | 'review' | 'denied' = 'review';
    
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
