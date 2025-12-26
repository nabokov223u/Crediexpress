import { useMemo } from "react";
import { motion } from "framer-motion";
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

  // Lógica de "Fuerza de Conexión" (Simulada)
  // Mayor entrada = Mejor perfil = Conexión más fuerte
  const connectionStrength = 0.3 + (downPaymentPct * 1.2); // 0.54 a 0.9
  
  // Configuración de Nodos Satélite (Aliados Financieros)
  const satellites = useMemo(() => {
    return Array.from({ length: 5 }).map((_, i) => {
      const angle = (i * 72) * (Math.PI / 180); // 5 nodos distribuidos
      return {
        id: i,
        angle, // Ángulo base
        distance: 140, // Radio de órbita
        size: 12 + Math.random() * 8, // Tamaño variable
        delay: i * 0.5
      };
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative z-10 overflow-hidden">
      <div className="relative w-96 h-96 flex items-center justify-center">
        
        {/* SVG Container para Conexiones y Órbitas */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Anillos de Órbita (Decorativos) */}
          <circle cx="50%" cy="50%" r="140" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" />
          <circle cx="50%" cy="50%" r="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" fill="none" strokeDasharray="4 4" />

          {/* Conexiones Dinámicas */}
          <g className="origin-center animate-spin-slow" style={{ transformOrigin: '50% 50%', animationDuration: '60s' }}>
            {satellites.map((sat, i) => {
              const x = 192 + Math.cos(sat.angle) * sat.distance;
              const y = 192 + Math.sin(sat.angle) * sat.distance;
              
              return (
                <motion.line
                  key={`line-${i}`}
                  x1="192"
                  y1="192"
                  x2={x}
                  y2={y}
                  stroke="url(#lineGradient)"
                  strokeWidth={2 * connectionStrength}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ 
                    pathLength: 1, 
                    opacity: connectionStrength,
                    strokeWidth: [1, 3 * connectionStrength, 1]
                  }}
                  transition={{ 
                    pathLength: { duration: 1, delay: sat.delay * 0.2 },
                    opacity: { duration: 0.5 },
                    strokeWidth: { 
                      duration: 2 + Math.random(), 
                      repeat: Infinity, 
                      repeatType: "reverse" 
                    }
                  }}
                />
              );
            })}
          </g>
        </svg>

        {/* Nodos Satélite (Aliados) */}
        <motion.div 
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          {satellites.map((sat, i) => {
            // Posicionamiento absoluto basado en ángulo
            const top = 50 + Math.sin(sat.angle) * (sat.distance / 192 * 50);
            const left = 50 + Math.cos(sat.angle) * (sat.distance / 192 * 50);

            return (
              <motion.div
                key={`sat-${i}`}
                className="absolute rounded-full bg-slate-800 border border-teal-500/50 shadow-[0_0_15px_rgba(45,212,191,0.3)] flex items-center justify-center"
                style={{
                  width: sat.size,
                  height: sat.size,
                  top: `${top}%`,
                  left: `${left}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: sat.delay }}
              >
                <div className="w-[40%] h-[40%] bg-teal-400 rounded-full animate-pulse" />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Nodo Central (Usuario / Originarsa) */}
        <motion.div
          className="absolute z-20 flex items-center justify-center w-32 h-32"
          animate={{ scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Glow Central */}
          <div className="absolute inset-0 bg-teal-500/20 blur-3xl rounded-full" />
          
          {/* Logo */}
          <motion.img
            src="/logo_menta_3d.png"
            alt="Hub"
            className="w-28 h-28 object-contain drop-shadow-2xl relative z-10"
            animate={{ rotateY: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>

        {/* Etiquetas de Datos (Estáticas en posición, dinámicas en valor) */}
        {/* Entrada */}
        <motion.div 
          className="absolute -right-2 top-16 bg-white/10 backdrop-blur-md border border-teal-500/30 p-3 rounded-xl shadow-xl z-30"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-teal-400" />
            <p className="text-xs text-teal-100 font-semibold uppercase tracking-wider">Tu Entrada</p>
          </div>
          <p className="text-xl font-bold text-white">
            ${downPaymentAmount.toLocaleString()}
            <span className="text-sm font-normal text-teal-200/70 ml-1">({Math.round(downPaymentPct * 100)}%)</span>
          </p>
        </motion.div>

        {/* Financiamiento */}
        <motion.div 
          className="absolute -left-2 bottom-16 bg-slate-900/60 backdrop-blur-md border border-slate-600/50 p-3 rounded-xl shadow-xl z-30"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-slate-400" />
            <p className="text-xs text-slate-300 font-semibold uppercase tracking-wider">Capital a Financiar</p>
          </div>
          <p className="text-xl font-bold text-white">
            ${financedAmount.toLocaleString()}
            <span className="text-sm font-normal text-slate-400 ml-1">({Math.round(financedPct * 100)}%)</span>
          </p>
        </motion.div>

      </div>

      {/* Texto Inferior */}
      <div className="mt-8 text-center max-w-xs relative z-30">
        <motion.div
          key={connectionStrength} // Re-animar si cambia la fuerza
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 mb-3"
        >
          <div className={`w-2 h-2 rounded-full ${connectionStrength > 0.6 ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
          <span className="text-xs font-medium text-teal-200">
            {connectionStrength > 0.7 ? "Perfil de alta conectividad" : "Buscando aliados..."}
          </span>
        </motion.div>
        
        <h3 className="text-xl font-bold text-white mb-1">
          Red de Aliados Activa
        </h3>
        <p className="text-slate-400 text-xs leading-relaxed">
          Nuestro algoritmo está conectando tu perfil con las mejores instituciones financieras para {loan.termMonths} meses.
        </p>
      </div>
    </div>
  );
}
