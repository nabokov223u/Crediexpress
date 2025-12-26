import { useMemo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFormData } from "../context/FormContext";

// --- PLEXUS BACKGROUND COMPONENT ---
const PlexusBackground = ({ intensity }: { intensity: number }) => {
  // Generar nodos aleatorios
  const nodes = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // Porcentaje
      y: Math.random() * 100, // Porcentaje
      size: Math.random() * 2 + 1,
    }));
  }, []);

  // Calcular conexiones (esto es costoso O(N^2), pero con 60 nodos es despreciable)
  const connections = useMemo(() => {
    const lines = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        // Distancia euclidiana aproximada (considerando aspecto cuadrado para simplificar)
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 15) { // Umbral de conexión
          lines.push({
            id: `${i}-${j}`,
            x1: nodes[i].x,
            y1: nodes[i].y,
            x2: nodes[j].x,
            y2: nodes[j].y,
            opacity: 1 - (dist / 15) // Más opaco si están cerca
          });
        }
      }
    }
    return lines;
  }, [nodes]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0d234a]">
      <svg className="w-full h-full" preserveAspectRatio="none">
        {/* Líneas de conexión */}
        {connections.map((line) => (
          <motion.line
            key={line.id}
            x1={`${line.x1}%`}
            y1={`${line.y1}%`}
            x2={`${line.x2}%`}
            y2={`${line.y2}%`}
            stroke="#2dd4bf"
            strokeWidth="0.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: line.opacity * 0.3 }}
            transition={{ duration: 2 }}
          />
        ))}

        {/* Nodos (Luces) */}
        {nodes.map((node) => (
          <motion.circle
            key={node.id}
            cx={`${node.x}%`}
            cy={`${node.y}%`}
            r={node.size}
            fill="#ccfbf1"
            initial={{ opacity: 0.1, scale: 0.8 }}
            animate={{ 
              opacity: [0.1, 0.8, 0.1], 
              scale: [0.8, 1.2, 0.8] 
            }}
            transition={{ 
              duration: 2 + Math.random() * 3, // Duración aleatoria para efecto orgánico
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Destellos aleatorios más intensos (Active Sparks) */}
        {Array.from({ length: 8 }).map((_, i) => (
           <motion.circle
             key={`spark-${i}`}
             cx={`${Math.random() * 100}%`}
             cy={`${Math.random() * 100}%`}
             r={3}
             fill="#fff"
             initial={{ opacity: 0, scale: 0 }}
             animate={{ opacity: [0, 1, 0], scale: [0, 2, 0] }}
             transition={{
               duration: 0.5,
               repeat: Infinity,
               repeatDelay: Math.random() * 3,
               delay: Math.random() * 5
             }}
           />
        ))}
      </svg>
      
      {/* Gradiente sutil para profundidad */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d234a] via-transparent to-[#0d234a]/50" />
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function InteractiveQuoteVisualizer() {
  const { data } = useFormData();
  const { loan } = data;
  
  // Estados de texto simulando proceso
  const [statusIndex, setStatusIndex] = useState(0);
  const statuses = [
    { title: "Buscando Aliados", subtitle: "Conectando con red financiera..." },
    { title: "Analizando Perfil", subtitle: "Verificando historial crediticio..." },
    { title: "Calculando Capacidad", subtitle: "Optimizando tu cuota mensual..." },
    { title: "Sincronizando Datos", subtitle: "Preparando tu pre-aprobación..." }
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
      
      {/* 1. FONDO ACTIVO (La Red) */}
      <PlexusBackground intensity={loan.downPaymentPct} />

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
            <h3 className="text-2xl font-bold text-white mb-2 tracking-wide">
              {currentStatus.title}
            </h3>
            <p className="text-teal-200/80 text-sm font-light">
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
