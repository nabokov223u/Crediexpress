import { useMemo } from "react";
import { motion } from "framer-motion";
import { useFormData } from "../context/FormContext";

export default function InteractiveQuoteVisualizer() {
  const { data } = useFormData();
  const { loan } = data;

  // Valores para visualización
  const downPaymentPct = loan.downPaymentPct;
  
  // Lógica de "Fuerza de Conexión"
  const connectionStrength = 0.3 + (downPaymentPct * 1.2); 

  // Generar nodos de la red (más complejos y distribuidos)
  const nodes = useMemo(() => {
    const count = 15; // Aumentamos nodos
    return Array.from({ length: count }).map((_, i) => {
      // Distribución en espiral/aleatoria para aspecto orgánico
      const angle = (i * 137.5) * (Math.PI / 180); 
      const radius = 80 + Math.sqrt(i) * 35; // Espiral hacia afuera
      
      return {
        id: i,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        size: 3 + Math.random() * 4,
        pulseDelay: Math.random() * 3,
        pulseDuration: 1.5 + Math.random() * 2
      };
    });
  }, []);

  // Generar conexiones entre nodos cercanos (Malla)
  const connections = useMemo(() => {
    const lines: { from: number; to: number; distance: number }[] = [];
    nodes.forEach((nodeA, i) => {
      nodes.forEach((nodeB, j) => {
        if (i < j) {
            const dx = nodeA.x - nodeB.x;
            const dy = nodeA.y - nodeB.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            // Conectar si están cerca (formar clusters)
            if (dist < 90) { 
                lines.push({ from: i, to: j, distance: dist });
            }
        }
      });
    });
    return lines;
  }, [nodes]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative z-10 overflow-hidden">
      <div className="relative w-full h-[450px] flex items-center justify-center">
        
        {/* SVG Container - Centrado en 0,0 */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="-250 -250 500 500">
          <defs>
            <radialGradient id="pulseGradient">
              <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0" />
              <stop offset="50%" stopColor="#2dd4bf" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grupo rotatorio lento para toda la red */}
          <g className="animate-spin-slow" style={{ animationDuration: '180s' }}>
            
            {/* Malla de conexiones entre nodos periféricos */}
            {connections.map((conn, i) => {
                const nodeA = nodes[conn.from];
                const nodeB = nodes[conn.to];
                return (
                    <motion.line
                        key={`mesh-${i}`}
                        x1={nodeA.x}
                        y1={nodeA.y}
                        x2={nodeB.x}
                        y2={nodeB.y}
                        stroke="#2dd4bf"
                        strokeWidth={0.5}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.05, 0.2, 0.05] }}
                        transition={{ 
                            duration: 3 + Math.random() * 2, 
                            repeat: Infinity,
                            delay: Math.random() * 5 
                        }}
                    />
                );
            })}

            {/* Rayos de conexión al centro (Data Streams) */}
            {nodes.map((node, i) => (
                <motion.line
                    key={`stream-${i}`}
                    x1={0}
                    y1={0}
                    x2={node.x}
                    y2={node.y}
                    stroke="url(#beamGradient)"
                    strokeWidth={connectionStrength}
                    strokeDasharray="4 4"
                    initial={{ strokeDashoffset: 0, opacity: 0 }}
                    animate={{ 
                        strokeDashoffset: -20,
                        opacity: [0, connectionStrength * 0.4, 0] 
                    }}
                    transition={{ 
                        duration: 1 + Math.random(), 
                        repeat: Infinity,
                        ease: "linear",
                        delay: node.pulseDelay 
                    }}
                />
            ))}

            {/* Nodos Activos */}
            {nodes.map((node, i) => (
                <g key={`node-group-${i}`} transform={`translate(${node.x}, ${node.y})`}>
                    {/* Halo del nodo */}
                    <motion.circle
                        r={node.size * 2}
                        fill="url(#pulseGradient)"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: [0, 0.3, 0], scale: [0.5, 1.5, 0.5] }}
                        transition={{ 
                            duration: node.pulseDuration, 
                            repeat: Infinity,
                            delay: node.pulseDelay 
                        }}
                    />
                    {/* Núcleo del nodo */}
                    <circle
                        r={node.size / 2}
                        fill="#ccfbf1" // teal-100
                        fillOpacity={0.8}
                    />
                </g>
            ))}
          </g>
        </svg>

        {/* Nodo Central (Logo) */}
        <motion.div
          className="absolute z-20 flex items-center justify-center w-32 h-32"
          animate={{ scale: [0.98, 1.02, 0.98] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 bg-teal-500/10 blur-3xl rounded-full" />
          <motion.img
            src="/logo_menta_3d.png"
            alt="Hub"
            className="w-28 h-28 object-contain drop-shadow-2xl relative z-10"
            animate={{ rotateY: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>

      </div>

      {/* Texto Inferior Simplificado */}
      <div className="text-center max-w-xs relative z-30 -mt-10">
        <motion.div
          key={connectionStrength}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 mb-3 backdrop-blur-sm"
        >
          <div className={`w-2 h-2 rounded-full ${connectionStrength > 0.6 ? 'bg-teal-400' : 'bg-yellow-400'} animate-pulse`} />
          <span className="text-xs font-medium text-teal-200">
            {connectionStrength > 0.7 ? "Red de alta velocidad activa" : "Escaneando mejores tasas..."}
          </span>
        </motion.div>
        
        <h3 className="text-xl font-bold text-white mb-1">
          Conectando con Aliados
        </h3>
        <p className="text-slate-400 text-xs leading-relaxed">
          Analizando tu perfil en tiempo real con múltiples instituciones financieras.
        </p>
      </div>
    </div>
  );
}
