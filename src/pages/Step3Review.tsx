import { useState } from "react";
import { useFormData } from "../context/FormContext";
import { submitPrequalification } from "../services/api";

export default function Step3Review({ onBack, onResult }:{ onBack:()=>void; onResult:(s:"approved"|"review"|"denied")=>void; }){
  const { data } = useFormData(); const [loading,setLoading]=useState(false); const [error,setError]=useState<string|null>(null);
  const handleSubmit = async ()=>{ setLoading(true); setError(null); try{ const res = await submitPrequalification(data); onResult(res.status); }catch(e){ setError("No pudimos enviar tu solicitud. Intenta nuevamente."); }finally{ setLoading(false);} };
  return (<div className="space-y-6">
    <div className="card p-4"><h3 className="text-lg font-semibold mb-3">Resumen</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div><p className="text-slate-500">Solicitante</p><p>{data.applicant.fullName}</p>
        <p className="text-slate-500 mt-1">Cédula</p><p>{data.applicant.idNumber}</p></div>
        <div><p className="text-slate-500">Vehículo</p>
          <p>Monto: ${data.loan.vehicleAmount.toLocaleString()}</p>
          <p>Entrada: {(data.loan.downPaymentPct*100).toFixed(0)}%</p>
          <p>Plazo: {data.loan.termMonths} meses</p>
        </div>
      </div></div>
    {error && <p className="error">{error}</p>}
    <div className="flex justify-between">
      <button type="button" className="btn-ghost" onClick={onBack}>Atrás</button>
      <button type="button" className="btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="spinner" />
            Evaluando…
          </span>
        ) : (
          "Calificar para crédito"
        )}
      </button>
    </div>
  </div>);
}