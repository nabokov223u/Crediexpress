import { useFormData } from "../context/FormContext";
import { useState } from "react";
import { monthlyPayment } from "../services/calculator";

export default function Step2Vehicle({ onBack, onNext }:{ onBack:()=>void; onNext:()=>void; }){
  const { data, setData } = useFormData();
  const [amount, setAmount] = useState<number>(data.loan.vehicleAmount);
  const [downPct, setDownPct] = useState<number>(data.loan.downPaymentPct*100);
  const [term, setTerm] = useState<number>(data.loan.termMonths);
  const clamp = (val:number, min:number, max:number)=> Math.min(Math.max(val, min), max);
  const down = Math.round(amount*(downPct/100));
  const financed = amount - down;
  const cuota = monthlyPayment(financed, term);

  // Handlers to edit Entrada and Monto a financiar directamente
  const handleEntradaChange = (val:number)=>{
    const minDown = amount*0.2; const maxDown = amount*0.5;
    const newDown = clamp(val, minDown, maxDown);
    const newPct = (newDown/amount)*100;
    setDownPct(Math.round(newPct));
  };
  const handleFinancedChange = (val:number)=>{
    const minFin = amount*0.5; // if down 50%
    const maxFin = amount*0.8; // if down 20%
    const newFin = clamp(val, minFin, maxFin);
    const newDown = amount - newFin;
    const newPct = (newDown/amount)*100;
    setDownPct(Math.round(newPct));
  };
  const saveAndNext = ()=>{ setData({ ...data, loan:{ vehicleAmount:amount, downPaymentPct:downPct/100, termMonths:term } }); onNext(); };
  return (<div className="space-y-6">
    <div className="grid gap-5">
      {/* Editable summary on top */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-4">
          <label className="label">Entrada</label>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">$</span>
            <input
              type="number"
              className="input h-11"
              value={down}
              min={Math.round(amount*0.2)}
              max={Math.round(amount*0.5)}
              onChange={(e)=> handleEntradaChange(Number(e.target.value))}
            />
          </div>
          <p className="helper mt-1">Entre 20% y 50% del valor del vehículo.</p>
        </div>
        <div className="card p-4">
          <label className="label">Monto a financiar</label>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">$</span>
            <input
              type="number"
              className="input h-11"
              value={financed}
              min={Math.round(amount*0.5)}
              max={Math.round(amount*0.8)}
              onChange={(e)=> handleFinancedChange(Number(e.target.value))}
            />
          </div>
          <p className="helper mt-1">Se actualiza automáticamente con tu entrada.</p>
        </div>
      </div>

      <div><div className="flex items-center justify-between mb-2"><label className="label">Monto del vehículo</label><div className="text-sm text-slate-700">${amount.toLocaleString()}</div></div>
      <input type="range" min={8000} max={60000} step={100} value={amount} onChange={(e)=>setAmount(Number(e.target.value))} className="w-full" />
      <p className="helper mt-1">Rango: $8.000 – $60.000</p></div>
      <div><div className="flex items-center justify-between mb-2"><label className="label">Entrada (%)</label><div className="text-sm text-slate-700">{downPct}%</div></div>
      <input type="range" min={20} max={50} step={1} value={downPct} onChange={(e)=>setDownPct(Number(e.target.value))} className="w-full" />
      <p className="helper mt-1">Entre 20% y 50%.</p></div>
      <div><div className="flex items-center justify-between mb-2"><label className="label">Plazo (meses)</label><div className="text-sm text-slate-700">{term} meses</div></div>
      <input type="range" min={12} max={72} step={3} value={term} onChange={(e)=>setTerm(Number(e.target.value))} className="w-full" /></div>
      {/* Summary cards replaced by editable inputs above */}
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