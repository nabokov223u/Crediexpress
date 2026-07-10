import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFormData } from "../context/FormContext";

// --- MAIN COMPONENT ---
export default function InteractiveQuoteVisualizer() {
  const { data } = useFormData();
  const { loan } = data;
  
  // Estados de texto simulando proceso
  const [statusIndex, setStatusIndex] = useState(0);
  const statuses = [
    { title: "Procesando solicitud", subtitle: "Verificando información..." },
    { title: "Analizando perfil", subtitle: "Consultando historial crediticio..." },
    { title: "Calculando capacidad", subtitle: "Evaluando cuota mensual..." },
    { title: "Finalizando análisis", subtitle: "Preparando resultado..." }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statuses.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const currentStatus = statuses[statusIndex];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden rounded-xl border border-white/10 shadow-2xl">
      
      {/* 1. FONDO DE GRADIENTE ESTÁTICO (Optimizado para tablets, sin partículas pesadas) */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#0d234a] via-[#101f3e] to-[#1a0f50]" />

      {/* 2. CONTENIDO SUPERPUESTO (Textos) */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center p-8 bg-[#0d234a]/30 backdrop-blur-[2px] rounded-2xl border border-white/5">
        
        {/* Icono animado central (Radar/Scan) */}
        <div className="relative mb-6 w-24 h-24 flex items-center justify-center">
            {/* Anillos de radar */}
            <motion.div 
                className="absolute inset-0 border-2 border-teal-500/30 rounded-full"
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div 
                className="absolute inset-0 border border-teal-400/20 rounded-full"
                animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
            {/* Icono central */}
            <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center backdrop-blur-md border border-teal-500/50">
                <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
        </div>

        {/* Textos cambiantes */}
        <AnimatePresence mode="wait">
          <motion.div
            key={statusIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <h3 className="text-3xl font-bold text-white mb-2 tracking-wide">
              {currentStatus.title}
            </h3>
            <p className="text-teal-200/80 text-base font-light">
              {currentStatus.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Indicadores de datos (Decorativos) */}
        <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-xs">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center">
                    <motion.div 
                        className="w-full h-1 bg-teal-900/50 rounded-full overflow-hidden"
                    >
                        <motion.div 
                            className="h-full bg-teal-400"
                            animate={{ width: ["0%", "100%"] }}
                            transition={{ 
                                duration: 1 + Math.random(), 
                                repeat: Infinity, 
                                repeatType: "reverse" 
                            }}
                        />
                    </motion.div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
