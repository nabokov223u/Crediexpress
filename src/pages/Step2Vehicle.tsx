import { useFormData } from "../context/FormContext";
import { useState } from "react";
import { monthlyPayment } from "../services/calculator";
import { submitPrequalification } from "../services/api";

export default function Step2Vehicle({ onBack, onResult }:{ onBack:()=>void; onResult:(s:"approved"|"review"|"denied")=>void; }){
  const { data, setData } = useFormData();
  const [amount, setAmount] = useState<number>(data.loan.vehicleAmount);
  const [downPct, setDownPct] = useState<number>(data.loan.downPaymentPct*100);
  const [term, setTerm] = useState<number>(data.loan.termMonths);
  const [amountStr, setAmountStr] = useState<string>(String(data.loan.vehicleAmount));
  const [pctStr, setPctStr] = useState<string>(String(Math.round(data.loan.downPaymentPct*100)));
  const [termStr, setTermStr] = useState<string>(String(data.loan.termMonths));
  const clamp = (val:number, min:number, max:number)=> Math.min(Math.max(val, min), max);
  const roundTo = (val:number, step:number)=> Math.round(val/step)*step;
  const down = Math.round(amount*(downPct/100));
  const financed = amount - down;
  const cuota = monthlyPayment(financed, term);

  // Handlers to edit Entrada and Monto a financiar directamente
  const syncContext = (a:number, pct:number, t:number)=>{
    setData({ ...data, loan:{ vehicleAmount:a, downPaymentPct:pct/100, termMonths:t } });
  };
  const handleEntradaChange = (val:number)=>{
    const minDown = amount*0.2; const maxDown = amount*0.5;
    const newDown = clamp(val, minDown, maxDown);
    const newPct = (newDown/amount)*100;
    const pct = Math.round(newPct);
    setDownPct(pct);
    syncContext(amount, pct, term);
  };
  const handleFinancedChange = (val:number)=>{
    const minFin = amount*0.5; // if down 50%
    const maxFin = amount*0.8; // if down 20%
    const newFin = clamp(val, minFin, maxFin);
    const newDown = amount - newFin;
    const newPct = (newDown/amount)*100;
    const pct = Math.round(newPct);
    setDownPct(pct);
    syncContext(amount, pct, term);
  };
  const handleAmountChange = (v:number)=>{ setAmount(v); setAmountStr(String(v)); syncContext(v, downPct, term); };
  const handlePctChange = (v:number)=>{ setDownPct(v); setPctStr(String(v)); syncContext(amount, v, term); };
  const handleTermChange = (v:number)=>{ setTerm(v); setTermStr(String(v)); syncContext(amount, downPct, v); };
  // Manual inputs for sliders
  // Free typing in numeric boxes, commit on blur/Enter
  const onAmountTyping = (v:string)=>{ setAmountStr(v.replace(/[^\d]/g, "")); };
  const commitAmount = ()=>{
    const parsed = Number(amountStr);
    if (Number.isFinite(parsed)) {
      const cl = clamp(roundTo(parsed, 100), 8000, 60000);
      handleAmountChange(cl);
    } else {
      setAmountStr(String(amount));
    }
  };
  const onPctTyping = (v:string)=>{ setPctStr(v.replace(/[^\d]/g, "")); };
  const commitPct = ()=>{
    const parsed = Number(pctStr);
    if (Number.isFinite(parsed)) {
      const cl = clamp(Math.round(parsed), 20, 50);
      handlePctChange(cl);
    } else {
      setPctStr(String(downPct));
    }
  };
  const onTermTyping = (v:string)=>{ setTermStr(v.replace(/[^\d]/g, "")); };
  const commitTerm = ()=>{
    const parsed = Number(termStr);
    if (Number.isFinite(parsed)) {
      const cl = clamp(roundTo(parsed, 3), 12, 72);
      handleTermChange(cl);
    } else {
      setTermStr(String(term));
    }
  };
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState<string|null>(null);
  const handleCalificar = async ()=>{
    const payload = { ...data, loan:{ vehicleAmount:amount, downPaymentPct:downPct/100, termMonths:term } } as typeof data;
    setData(payload);
    setLoading(true); setError(null);
    try{
      const res = await submitPrequalification(payload);
      onResult(res.status);
    }catch{
      setError("No pudimos enviar tu solicitud. Intenta nuevamente.");
    }finally{
      setLoading(false);
    }
  };
  return (<div className="space-y-6">
    <div className="grid gap-5">
      {/* Sliders primero con inputs manuales a la derecha */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label">Monto del vehículo</label>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">$</span>
            <input
              type="text"
              inputMode="numeric"
              className="input h-11 w-32 text-right text-base md:text-lg font-medium no-spin bg-white/95 shadow-sm border-slate-300 focus:ring-modern"
              value={amountStr}
              onChange={(e)=>onAmountTyping(e.target.value)}
              onBlur={commitAmount}
              onKeyDown={(e)=>{ if(e.key==='Enter'){ e.currentTarget.blur(); } }}
            />
          </div>
        </div>
        <input type="range" min={8000} max={60000} step={100} value={amount} onChange={(e)=>handleAmountChange(Number(e.target.value))} className="w-full" />
        <p className="helper mt-1">Rango: $8.000 – $60.000</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label">Entrada (%)</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              className="input h-11 w-24 text-right text-base md:text-lg font-medium no-spin bg-white/95 shadow-sm border-slate-300 focus:ring-modern"
              value={pctStr}
              onChange={(e)=>onPctTyping(e.target.value)}
              onBlur={commitPct}
              onKeyDown={(e)=>{ if(e.key==='Enter'){ e.currentTarget.blur(); } }}
            />
            <span className="text-slate-500">%</span>
          </div>
        </div>
        <input type="range" min={20} max={50} step={1} value={downPct} onChange={(e)=>handlePctChange(Number(e.target.value))} className="w-full" />
        <p className="helper mt-1">Entre 20% y 50%.</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label">Plazo (meses)</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              className="input h-11 w-24 text-right text-base md:text-lg font-medium no-spin bg-white/95 shadow-sm border-slate-300 focus:ring-modern"
              value={termStr}
              onChange={(e)=>onTermTyping(e.target.value)}
              onBlur={commitTerm}
              onKeyDown={(e)=>{ if(e.key==='Enter'){ e.currentTarget.blur(); } }}
            />
          </div>
        </div>
        <input type="range" min={12} max={72} step={3} value={term} onChange={(e)=>handleTermChange(Number(e.target.value))} className="w-full" />
      </div>

      {/* Campos editables debajo: Entrada y Monto a financiar */}
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
      {/* Summary cards replaced by editable inputs above */}
      {/* Cuota estimada ahora solo se muestra sobre la imagen en el hero de Step 2 */}
    </div>
    {error && <p className="error">{error}</p>}
    <div className="flex justify-between">
      <button type="button" className="btn-ghost" onClick={onBack}>Atrás</button>
      <button type="button" className="btn-primary" onClick={handleCalificar} disabled={loading}>
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="spinner" />
            Calificando…
          </span>
        ) : (
          "Calificar para crédito"
        )}
      </button>
    </div>
  </div>);
}