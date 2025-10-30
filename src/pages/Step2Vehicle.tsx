import { useFormData } from "../context/FormContext";
import { useState } from "react";
import { monthlyPayment } from "../services/calculator";

export default function Step2Vehicle({ onBack, onNext }:{ onBack:()=>void; onNext:()=>void; }){
  const { data, setData } = useFormData();
  const [amount, setAmount] = useState<number>(data.loan.vehicleAmount);
  const [downPct, setDownPct] = useState<number>(data.loan.downPaymentPct*100);
  const [term, setTerm] = useState<number>(data.loan.termMonths);
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
  const handleAmountChange = (v:number)=>{ setAmount(v); syncContext(v, downPct, term); };
  const handlePctChange = (v:number)=>{ setDownPct(v); syncContext(amount, v, term); };
  const handleTermChange = (v:number)=>{ setTerm(v); syncContext(amount, downPct, v); };
  // Manual inputs for sliders
  const onAmountInput = (v:string)=>{
    const n = roundTo(Number(v || 0), 100);
    const cl = clamp(n, 8000, 60000);
    handleAmountChange(cl);
  };
  const onPctInput = (v:string)=>{
    const n = Math.round(Number(v || 0));
    const cl = clamp(n, 20, 50);
    handlePctChange(cl);
  };
  const onTermInput = (v:string)=>{
    const n = Number(v || 0);
    const rounded = roundTo(n, 3);
    const cl = clamp(rounded, 12, 72);
    handleTermChange(cl);
  };
  const saveAndNext = ()=>{ setData({ ...data, loan:{ vehicleAmount:amount, downPaymentPct:downPct/100, termMonths:term } }); onNext(); };
  return (<div className="space-y-6">
    <div className="grid gap-5">
      {/* Sliders primero con inputs manuales a la derecha */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label">Monto del vehículo</label>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">$</span>
            <input type="number" className="input h-10 w-28 text-right" value={amount} min={8000} max={60000} step={100} onChange={(e)=>onAmountInput(e.target.value)} />
          </div>
        </div>
        <input type="range" min={8000} max={60000} step={100} value={amount} onChange={(e)=>handleAmountChange(Number(e.target.value))} className="w-full" />
        <p className="helper mt-1">Rango: $8.000 – $60.000</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label">Entrada (%)</label>
          <div className="flex items-center gap-2">
            <input type="number" className="input h-10 w-20 text-right" value={downPct} min={20} max={50} step={1} onChange={(e)=>onPctInput(e.target.value)} />
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
            <input type="number" className="input h-10 w-24 text-right" value={term} min={12} max={72} step={3} onChange={(e)=>onTermInput(e.target.value)} />
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
    <div className="flex justify-between">
      <button type="button" className="btn-ghost" onClick={onBack}>Atrás</button>
      <button type="button" className="btn-primary" onClick={saveAndNext}>Siguiente</button>
    </div>
  </div>);
}