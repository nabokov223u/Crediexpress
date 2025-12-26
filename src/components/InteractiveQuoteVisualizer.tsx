import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFormData } from "../context/FormContext";

export default function InteractiveQuoteVisualizer() {
  const { data } = useFormData();
  const { loan } = data;

  // Valores para visualización
  const downPaymentPct = loan.downPaymentPct; // 0.2 a 0.5
  const financedPct = 1 - downPaymentPct;
  
  const vehicleAmount = loan.vehicleAmount;
  const downPaymentAmount = vehicleAmount * downPaymentPct;
  const financedAmount = vehicleAmount * financedPct;

  // Configuración del círculo SVG
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - downPaymentPct);

  // Animación reactiva basada en el plazo (termMonths: 12-72)
  // Menor plazo = latido más rápido (urgencia/rapidez)
  // Mayor plazo = latido más lento (calma)
  const pulseDuration = 8 - ((loan.termMonths - 12) / 60) * 6; // Rango de 8s (lento) a 2s (rápido) invertido? 
  // Mejor: Menor plazo (12) = Rápido (2s). Mayor plazo (72) = Lento (6s).
  const spinDuration = 2 + ((loan.termMonths - 12) / 60) * 10; 

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative z-10">
      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* Círculo Base (Financiamiento) */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-2xl">
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="24"
            fill="transparent"
          />
          {/* Círculo de Progreso (Entrada) */}
          <motion.circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="#2dd4bf" // teal-400
            strokeWidth="24"
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]"
          />
        </svg>

        {/* Orbe Central / Logo 3D */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ 
            scale: [0.85, 0.95, 0.85],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Halo de energía */}
          <motion.div 
            className="absolute w-48 h-48 rounded-full bg-teal-500/10 blur-2xl"
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          
          {/* Logo 3D Giratorio */}
          <motion.img
            src="/logo_menta_3d.png"
            alt="Core"
            className="w-40 h-40 object-contain relative z-10"
            animate={{
              rotateY: 360,
              y: [-5, 5, -5]
            }}
            transition={{
              rotateY: { duration: spinDuration * 3, repeat: Infinity, ease: "linear" },
              y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
          />
        </motion.div>

        {/* Etiquetas Flotantes Conectadas */}
        {/* Entrada */}
        <motion.div 
          className="absolute -right-4 top-10 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl shadow-xl"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-xs text-teal-300 font-semibold uppercase tracking-wider mb-1">Tu Entrada</p>
          <p className="text-xl font-bold text-white">
            ${downPaymentAmount.toLocaleString()}
            <span className="text-sm font-normal text-white/70 ml-1">({Math.round(downPaymentPct * 100)}%)</span>
          </p>
        </motion.div>

        {/* Financiamiento */}
        <motion.div 
          className="absolute -left-4 bottom-10 bg-blue-900/40 backdrop-blur-md border border-blue-500/30 p-3 rounded-xl shadow-xl"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-xs text-blue-300 font-semibold uppercase tracking-wider mb-1">Te Prestamos</p>
          <p className="text-xl font-bold text-white">
            ${financedAmount.toLocaleString()}
            <span className="text-sm font-normal text-white/70 ml-1">({Math.round(financedPct * 100)}%)</span>
          </p>
        </motion.div>
      </div>

      {/* Texto Inferior Dinámico */}
      <div className="mt-12 text-center max-w-xs">
        <motion.h3 
          key={loan.termMonths}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-white mb-2"
        >
          {loan.termMonths} Meses Plazo
        </motion.h3>
        <p className="text-slate-300 text-sm">
          Ajusta los valores para encontrar tu cuota ideal. El gráfico se actualiza en tiempo real.
        </p>
      </div>
    </div>
  );
}
