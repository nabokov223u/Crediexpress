import type { FormData } from "../context/FormContext";
import { savePrequalificationToFirebase, type PrequalificationResult } from "./firebase";

export async function submitPrequalification(payload: FormData): Promise<PrequalificationResult & { id?: string }> {
  // Simular delay de procesamiento
  await new Promise(r => setTimeout(r, 1200));
  
  // Lógica de evaluación original
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
    // Guardar en Firebase
    const applicationId = await savePrequalificationToFirebase(payload, result);
    
    return {
      ...result,
      id: applicationId
    };
  } catch (error) {
    console.error('Error guardando en Firebase, continuando sin persistir:', error);
    
    // Si falla Firebase, continuar con la lógica original
    return result;
  }
}