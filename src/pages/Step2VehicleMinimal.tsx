import { useFormData } from "../context/FormContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { monthlyPayment } from "../services/calculator";
import { submitPrequalification } from "../services/api";

export default function Step2VehicleMinimal({ 
  onBack, 
  onResult 
}: { 
  onBack: () => void; 
  onResult: (s: "approved" | "review" | "denied") => void; 
}) {
  const { data, setData } = useFormData();
  const [amount, setAmount] = useState<number>(data.loan.vehicleAmount);
  const [downPct, setDownPct] = useState<number>(data.loan.downPaymentPct * 100);
  const [term, setTerm] = useState<number>(data.loan.termMonths);
  
  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
  const roundTo = (val: number, step: number) => Math.round(val / step) * step;
  
  const down = Math.round(amount * (downPct / 100));
  const financed = amount - down;
  const cuota = monthlyPayment(financed, term);

  const syncContext = (a: number, pct: number, t: number) => {
    setData({ ...data, loan: { vehicleAmount: a, downPaymentPct: pct / 100, termMonths: t } });
  };

  const handleAmountChange = (v: number) => {
    const clamped = clamp(roundTo(v, 100), 8000, 60000);
    setAmount(clamped);
    syncContext(clamped, downPct, term);
  };

  const handlePctChange = (v: number) => {
    const clamped = clamp(Math.round(v), 20, 50);
    setDownPct(clamped);
    syncContext(amount, clamped, term);
  };

  const handleTermChange = (v: number) => {
    const clamped = clamp(roundTo(v, 3), 12, 72);
    setTerm(clamped);
    syncContext(amount, downPct, clamped);
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalificar = async () => {
    const payload = { 
      ...data, 
      loan: { 
        vehicleAmount: amount, 
        downPaymentPct: downPct / 100, 
        termMonths: term 
      } 
    };
    setData(payload);
    setLoading(true);
    setError(null);
    
    try {
      const res = await submitPrequalification(payload);
      onResult(res.status);
    } catch {
      setError("No pudimos enviar tu solicitud. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full space-y-6"
    >
      {/* Header */}
      <div className="mb-8">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold text-slate-900 mb-3"
        >
          Detalles del crédito
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-700 text-base md:text-lg"
        >
          Personaliza tu financiamiento
        </motion.p>
      </div>

      {/* Resumen destacado de la cuota */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-brand to-modern rounded-2xl p-6 text-white text-center"
      >
        <p className="text-sm font-medium mb-2 opacity-90">Tu cuota mensual estimada</p>
        <p className="text-5xl font-bold">${cuota.toLocaleString("es-EC")}</p>
        <p className="text-xs mt-3 opacity-80">Por {term} meses • Tasa referencial 2% mensual</p>
      </motion.div>

      {/* Sliders */}
      <div className="space-y-6">
        {/* Monto del vehículo */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-slate-800">
              Monto del vehículo
            </label>
            <div className="text-2xl font-bold text-brand">
              ${amount.toLocaleString("es-EC")}
            </div>
          </div>
          <input
            type="range"
            min={8000}
            max={60000}
            step={500}
            value={amount}
            onChange={(e) => handleAmountChange(Number(e.target.value))}
            className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-brand [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>$8.000</span>
            <span>$60.000</span>
          </div>
        </div>

        {/* Entrada */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-slate-800">
              Entrada
            </label>
            <div className="text-2xl font-bold text-modern">
              {downPct}% <span className="text-base font-normal text-slate-600">(${down.toLocaleString("es-EC")})</span>
            </div>
          </div>
          <input
            type="range"
            min={20}
            max={50}
            step={1}
            value={downPct}
            onChange={(e) => handlePctChange(Number(e.target.value))}
            className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-modern [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-modern [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>20% mínimo</span>
            <span>50% máximo</span>
          </div>
        </div>

        {/* Plazo */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-slate-800">
              Plazo
            </label>
            <div className="text-2xl font-bold text-slate-700">
              {term} meses
            </div>
          </div>
          <input
            type="range"
            min={12}
            max={72}
            step={3}
            value={term}
            onChange={(e) => handleTermChange(Number(e.target.value))}
            className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-700 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-slate-700 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>12 meses</span>
            <span>72 meses</span>
          </div>
        </div>
      </div>

      {/* Resumen de financiamiento */}
      <div className="grid grid-cols-2 gap-4 pt-4">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <p className="text-xs font-medium text-slate-600 mb-1">Monto a financiar</p>
          <p className="text-2xl font-bold text-slate-900">${financed.toLocaleString("es-EC")}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <p className="text-xs font-medium text-slate-600 mb-1">Entrada inicial</p>
          <p className="text-2xl font-bold text-slate-900">${down.toLocaleString("es-EC")}</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700"
        >
          {error}
        </motion.div>
      )}

      {/* Botones */}
      <div className="flex gap-4 pt-4">
        <motion.button
          type="button"
          onClick={onBack}
          className="flex-1 h-14 rounded-xl border-2 border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 transition-all text-lg"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          Atrás
        </motion.button>
        <motion.button
          type="button"
          onClick={handleCalificar}
          disabled={loading}
          className="flex-1 h-14 bg-gradient-to-r from-brand to-modern text-white rounded-xl font-bold text-lg shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          whileHover={{ scale: loading ? 1 : 1.01 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <motion.span
                className="inline-block w-5 h-5 border-3 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Calificando...
            </span>
          ) : (
            "Calificar para crédito"
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
