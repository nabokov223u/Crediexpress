import { useFormData } from "../context/FormContext";
import { useState } from "react";
import { monthlyPayment } from "../services/calculator";

export default function Step2Vehicle({ onBack, onNext }:{ onBack:()=>void; onNext:()=>void; }){
  const { data, setData } = useFormData();
  const [amount, setAmount] = useState<number>(data.loan.vehicleAmount);
  const [downPct, setDownPct] = useState<number>(data.loan.downPaymentPct*100);
  const [term, setTerm] = useState<number>(data.loan.termMonths);
  const down = Math.round(amount*(downPct/100)); const financed = amount - down; const cuota = monthlyPayment(financed, term);
  const saveAndNext = ()=>{ setData({ ...data, loan:{ vehicleAmount:amount, downPaymentPct:downPct/100, termMonths:term } }); onNext(); };
  return (<div className="space-y-6">
    <div className="grid gap-5">
      <div><div className="flex items-center justify-between mb-2"><label className="label">Monto del vehículo</label><div className="text-sm text-slate-700">${amount.toLocaleString()}</div></div>
      <input type="range" min={8000} max={60000} step={100} value={amount} onChange={(e)=>setAmount(Number(e.target.value))} className="w-full" />
      <p className="helper mt-1">Rango: $8.000 – $60.000</p></div>
      <div><div className="flex items-center justify-between mb-2"><label className="label">Entrada (%)</label><div className="text-sm text-slate-700">{downPct}%</div></div>
      <input type="range" min={20} max={50} step={1} value={downPct} onChange={(e)=>setDownPct(Number(e.target.value))} className="w-full" />
      <p className="helper mt-1">Entre 20% y 50%.</p></div>
      <div><div className="flex items-center justify-between mb-2"><label className="label">Plazo (meses)</label><div className="text-sm text-slate-700">{term} meses</div></div>
      <input type="range" min={12} max={72} step={3} value={term} onChange={(e)=>setTerm(Number(e.target.value))} className="w-full" /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-4"><p className="text-sm text-slate-500">Entrada</p><p className="text-2xl font-semibold text-origin">${down.toLocaleString()}</p></div>
        <div className="card p-4"><p className="text-sm text-slate-500">Monto a financiar</p><p className="text-2xl font-semibold text-origin">${financed.toLocaleString()}</p></div>
      </div>
      <div className="p-4 rounded-2xl bg-white border border-slate-100" style={{boxShadow:"0 8px 24px rgba(16,24,40,0.08)"}}>
        <p className="text-sm text-slate-500">Cuota estimada</p>
        <p className="text-3xl font-semibold text-origin">${cuota.toFixed(2)}</p>
        <p className="text-xs text-slate-500 mt-1">Estimación referencial (demo).</p>
      </div>
    </div>
    <div className="flex justify-between">
      <button type="button" className="btn-ghost" onClick={onBack}>Atrás</button>
      <button type="button" className="btn-primary" onClick={saveAndNext}>Siguiente</button>
    </div>
  </div>);
}