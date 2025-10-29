import type { FormData } from "../context/FormContext";
export async function submitPrequalification(payload: FormData){
  await new Promise(r=>setTimeout(r,1200));
  const financed = payload.loan.vehicleAmount*(1-payload.loan.downPaymentPct);
  if (financed <= 16000 && payload.loan.termMonths <= 60) return { status: "approved" as const };
  if (financed <= 25000) return { status: "review" as const };
  return { status: "denied" as const };
}