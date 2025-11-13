import { useFormData } from "../context/FormContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { monthlyPayment } from "../services/calculator";
import { submitPrequalification } from "../services/api";
import CountUp from "../components/CountUp";
import Tooltip from "../components/Tooltip";

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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [cuotaBounce, setCuotaBounce] = useState<'up' | 'down' | null>(null);
  
  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
  const roundTo = (val: number, step: number) => Math.round(val / step) * step;
  
  const down = Math.round(amount * (downPct / 100));
  const financed = amount - down;
  const cuota = monthlyPayment(financed, term);

  // Efecto bounce para cambios en cuota
  const triggerBounce = (newCuota: number, oldCuota: number) => {
    if (newCuota > oldCuota) {
      setCuotaBounce('up');
    } else if (newCuota < oldCuota) {
      setCuotaBounce('down');
    }
    setTimeout(() => setCuotaBounce(null), 500);
  };

  const syncContext = (a: number, pct: number, t: number) => {
    setData({ ...data, loan: { vehicleAmount: a, downPaymentPct: pct / 100, termMonths: t } });
  };

  const handleAmountChange = (v: number) => {
    const clamped = clamp(roundTo(v, 100), 15000, 60000);
    const oldCuota = cuota;
    setAmount(clamped);
    syncContext(clamped, downPct, term);
    const newCuota = monthlyPayment(clamped - Math.round(clamped * (downPct / 100)), term);
    triggerBounce(newCuota, oldCuota);
  };

  const handlePctChange = (v: number) => {
    const clamped = clamp(Math.round(v), 20, 50);
    const oldCuota = cuota;
    setDownPct(clamped);
    syncContext(amount, clamped, term);
    const newCuota = monthlyPayment(amount - Math.round(amount * (clamped / 100)), term);
    triggerBounce(newCuota, oldCuota);
  };

  const handleTermChange = (v: number) => {
    const clamped = clamp(roundTo(v, 3), 12, 72);
    const oldCuota = cuota;
    setTerm(clamped);
    syncContext(amount, downPct, clamped);
    const newCuota = monthlyPayment(financed, clamped);
    triggerBounce(newCuota, oldCuota);
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

      {/* Resumen destacado de la cuota con glassmorphism y bounce */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ 
          opacity: 1, 
          scale: cuotaBounce ? (cuotaBounce === 'down' ? [1, 1.05, 1] : [1, 0.95, 1]) : 1,
        }}
        transition={{ delay: 0.2, scale: { duration: 0.3 } }}
        className={`bg-gradient-to-br from-brand/90 via-modern/90 to-brand/90 backdrop-blur-xl rounded-2xl p-6 text-white text-center relative overflow-hidden bg-[length:200%_200%] border border-white/20 ${
          cuotaBounce === 'up' ? 'ring-2 ring-red-400' : cuotaBounce === 'down' ? 'ring-2 ring-green-400' : ''
        }`}
        style={{
          backgroundPosition: '0% 50%',
        }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <div className="relative z-10">
          <p className="text-sm font-medium mb-2 opacity-90">Tu cuota mensual estimada</p>
          <p className="text-5xl font-bold">
            <CountUp value={cuota} prefix="$" duration={0.8} />
          </p>
          <p className="text-xs mt-3 opacity-80">Por {term} meses • TNA 15.6% (Sistema Francés)</p>
        </div>
      </motion.div>

      {/* Sliders */}
      <div className="space-y-6">
        {/* Precio del vehículo con input editable */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Tooltip content="Precio total del vehículo que deseas financiar" position="top">
              <label className="text-base font-bold text-slate-900 cursor-help border-b-2 border-dashed border-slate-400">
                Precio del vehículo
              </label>
            </Tooltip>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">$</span>
              <input
                type="text"
                value={amount.toLocaleString()}
                onChange={(e) => {
                  const val = parseInt(e.target.value.replace(/\D/g, '')) || 15000;
                  handleAmountChange(val);
                }}
                className="text-3xl font-bold text-brand bg-transparent border-b-2 border-transparent hover:border-brand/30 focus:border-brand focus:outline-none w-40 text-right transition-colors"
              />
            </div>
          </div>
          
          {/* Presets rápidos */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => handleAmountChange(15000)}
              className="flex-1 px-3 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              $15k
            </button>
            <button
              onClick={() => handleAmountChange(25000)}
              className="flex-1 px-3 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              $25k
            </button>
            <button
              onClick={() => handleAmountChange(35000)}
              className="flex-1 px-3 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              $35k
            </button>
            <button
              onClick={() => handleAmountChange(50000)}
              className="flex-1 px-3 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              $50k
            </button>
          </div>
          
          <input
            type="range"
            min={15000}
            max={60000}
            step={500}
            value={amount}
            onChange={(e) => handleAmountChange(Number(e.target.value))}
            className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer slider-with-marks [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-brand [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg"
            style={{
              background: `linear-gradient(to right, #1a0f50 0%, #1a0f50 ${((amount - 15000) / (60000 - 15000)) * 100}%, #e2e8f0 ${((amount - 15000) / (60000 - 15000)) * 100}%, #e2e8f0 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>$15k</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-400">$25k</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-400">$35k</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-400">$50k</span>
            <span className="text-slate-400">|</span>
            <span>$60k</span>
          </div>
        </div>

        {/* Entrada con presets */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Tooltip content="Dinero que pagas al inicio (mínimo 20%, máximo 50%)" position="top">
              <label className="text-base font-bold text-slate-900 cursor-help border-b-2 border-dashed border-slate-400">
                Entrada
              </label>
            </Tooltip>
            <div className="text-3xl font-bold text-modern">
              {downPct}% <span className="text-lg font-normal text-slate-600">(<CountUp value={down} prefix="$" duration={0.5} />)</span>
            </div>
          </div>
          
          {/* Presets rápidos */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => handlePctChange(20)}
              className="flex-1 px-3 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              20%
            </button>
            <button
              onClick={() => handlePctChange(30)}
              className="flex-1 px-3 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              30%
            </button>
            <button
              onClick={() => handlePctChange(40)}
              className="flex-1 px-3 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              40%
            </button>
            <button
              onClick={() => handlePctChange(50)}
              className="flex-1 px-3 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              50%
            </button>
          </div>
          
          <input
            type="range"
            min={20}
            max={50}
            step={1}
            value={downPct}
            onChange={(e) => handlePctChange(Number(e.target.value))}
            className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-modern [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-modern [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg"
            style={{
              background: `linear-gradient(to right, #e0d2a2 0%, #e0d2a2 ${((downPct - 20) / (50 - 20)) * 100}%, #e2e8f0 ${((downPct - 20) / (50 - 20)) * 100}%, #e2e8f0 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>20%</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-400">30%</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-400">40%</span>
            <span className="text-slate-400">|</span>
            <span>50%</span>
          </div>
        </div>

        {/* Plazo con presets */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Tooltip content="Tiempo en el que pagarás el crédito (12 a 72 meses)" position="top">
              <label className="text-base font-bold text-slate-900 cursor-help border-b-2 border-dashed border-slate-400">
                Plazo
              </label>
            </Tooltip>
            <div className="text-3xl font-bold text-slate-700">
              {term} <span className="text-lg font-normal text-slate-600">meses</span>
            </div>
          </div>
          
          {/* Presets rápidos */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => handleTermChange(12)}
              className="flex-1 px-3 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              12m
            </button>
            <button
              onClick={() => handleTermChange(24)}
              className="flex-1 px-3 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              24m
            </button>
            <button
              onClick={() => handleTermChange(36)}
              className="flex-1 px-3 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              36m
            </button>
            <button
              onClick={() => handleTermChange(48)}
              className="flex-1 px-3 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              48m
            </button>
            <button
              onClick={() => handleTermChange(60)}
              className="flex-1 px-3 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              60m
            </button>
          </div>
          
          <input
            type="range"
            min={12}
            max={72}
            step={3}
            value={term}
            onChange={(e) => handleTermChange(Number(e.target.value))}
            className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-slate-700 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-slate-700 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg"
            style={{
              background: `linear-gradient(to right, #334155 0%, #334155 ${((term - 12) / (72 - 12)) * 100}%, #e2e8f0 ${((term - 12) / (72 - 12)) * 100}%, #e2e8f0 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>12</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-400">24</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-400">36</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-400">48</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-400">60</span>
            <span className="text-slate-400">|</span>
            <span>72</span>
          </div>
        </div>
      </div>

      {/* Toggle calculadora avanzada - DESHABILITADO */}
      {/* <div className="flex justify-center pt-2">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="group flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-600 hover:text-brand bg-slate-100 hover:bg-brand/10 rounded-lg transition-all duration-300"
        >
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${showAdvanced ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {showAdvanced ? 'Ocultar detalles' : 'Ver detalles financieros'}
        </button>
      </div> */}

      {/* Calculadora avanzada (sutil) - DESHABILITADO */}
      {/* <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200 space-y-3">
              <div className="bg-white rounded-lg p-2.5 border border-slate-200">
                <p className="text-[11px] font-semibold text-slate-600 mb-1.5">Primera cuota</p>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-600">Capital:</span>
                    <span className="text-xs font-bold text-slate-800">
                      ${((financed * 0.013) * 0.4).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-600">Interés:</span>
                    <span className="text-xs font-bold text-modern">
                      ${((financed * 0.013) * 0.6).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded-lg p-2.5 border border-slate-200">
                  <p className="text-[10px] font-medium text-slate-600 mb-0.5">Total a pagar</p>
                  <p className="text-sm font-bold text-slate-900">
                    ${(cuota * term).toLocaleString('es', { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-2.5 border border-slate-200">
                  <p className="text-[10px] font-medium text-slate-600 mb-0.5">Intereses</p>
                  <p className="text-sm font-bold text-modern">
                    ${((cuota * term) - financed).toLocaleString('es', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence> */}

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
          className="flex-1 h-14 bg-gradient-to-r from-brand via-modern to-brand text-white rounded-xl font-bold text-lg shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 bg-[length:200%_100%]"
          style={{
            backgroundPosition: '0% 50%',
          }}
          animate={{
            backgroundPosition: loading ? '0% 50%' : ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 3,
            repeat: loading ? 0 : Infinity,
            ease: 'linear',
          }}
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
