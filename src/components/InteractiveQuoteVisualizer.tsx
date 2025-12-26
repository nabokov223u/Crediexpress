import { useMemo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFormData } from "../context/FormContext";

// Icono de "Usuario/Nodo" simplificado
const NodeIcon = ({ x, y, size, color, delay }: { x: number; y: number; size: number; color: string; delay: number }) => (
  <motion.g
    transform={`translate(${x}, ${y})`}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay }}
  >
    {/* Glow effect */}
    <motion.circle
      r={size * 1.5}
      fill={color}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.3, 0] }}
      transition={{ duration: 2, repeat: Infinity, delay: delay + 1 }}
    />
    
    {/* Outer Box */}
    <rect
      x={-size}
      y={-size}
      width={size * 2}
      height={size * 2}
      rx={4}
      fill="#0f172a" // slate-900
      stroke={color}
      strokeWidth={1.5}
    />
    
    {/* Inner "Person" shape */}
    <circle cx={0} cy={-size * 0.2} r={size * 0.25} fill={color} />
    <path
      d={`M ${-size * 0.5} ${size * 0.6} Q 0 ${size * 0.1} ${size * 0.5} ${size * 0.6} v ${size * 0.2} h ${-size} v ${-size * 0.2} z`}
      fill={color}
    />
  </motion.g>
);

// Paquete de datos viajando
const DataPacket = ({ path, color, duration, delay }: { path: string; color: string; duration: number; delay: number }) => (
  <motion.circle
    r={3}
    fill={color}
    filter="drop-shadow(0 0 4px currentColor)"
  >
    <animateMotion
      dur={`${duration}s`}
      repeatCount="indefinite"
      path={path}
      begin={`${delay}s`}
      keyPoints="0;1"
      keyTimes="0;1"
      calcMode="linear"
    />
  </motion.circle>
);

export default function InteractiveQuoteVisualizer() {
  const { data } = useFormData();
  const { loan } = data;
  const downPaymentPct = loan.downPaymentPct;
  
  // Intensidad basada en el pago inicial
  const intensity = 1 + (downPaymentPct * 2); 

  // Definición de la Red (Posiciones fijas para estética controlada)
  // Coordenadas relativas a un viewBox de 600x400
  const nodes = [
    { id: 0, x: 300, y: 200, type: 'hub' }, // Centro
    { id: 1, x: 150, y: 100, type: 'node' },
    { id: 2, x: 450, y: 100, type: 'node' },
    { id: 3, x: 150, y: 300, type: 'node' },
    { id: 4, x: 450, y: 300, type: 'node' },
    { id: 5, x: 50, y: 200, type: 'leaf' },
    { id: 6, x: 550, y: 200, type: 'leaf' },
    { id: 7, x: 300, y: 50, type: 'leaf' },
    { id: 8, x: 300, y: 350, type: 'leaf' },
    { id: 9, x: 100, y: 50, type: 'leaf' },
    { id: 10, x: 500, y: 50, type: 'leaf' },
    { id: 11, x: 100, y: 350, type: 'leaf' },
    { id: 12, x: 500, y: 350, type: 'leaf' },
  ];

  // Conexiones (Edges)
  const edges = [
    { from: 0, to: 1 }, { from: 0, to: 2 }, { from: 0, to: 3 }, { from: 0, to: 4 }, // Hub a Nodos
    { from: 1, to: 5 }, { from: 1, to: 9 }, { from: 1, to: 7 }, // Nodo 1 a hojas
    { from: 2, to: 6 }, { from: 2, to: 10 }, { from: 2, to: 7 }, // Nodo 2 a hojas
    { from: 3, to: 5 }, { from: 3, to: 11 }, { from: 3, to: 8 }, // Nodo 3 a hojas
    { from: 4, to: 6 }, { from: 4, to: 12 }, { from: 4, to: 8 }, // Nodo 4 a hojas
    { from: 1, to: 2 }, { from: 3, to: 4 }, { from: 1, to: 3 }, { from: 2, to: 4 } // Interconexiones
  ];

  // Estado para reiniciar animación de "encendido"
  const [key, setKey] = useState(0);

  useEffect(() => {
    // Reiniciar animación si cambia drásticamente la entrada (opcional)
    // setKey(k => k + 1);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative z-10 overflow-hidden bg-[#0d234a]/50 backdrop-blur-sm rounded-xl border border-white/5">
      
      {/* Grid de fondo estilo "Blueprint" */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ 
            backgroundImage: 'linear-gradient(#2dd4bf 1px, transparent 1px), linear-gradient(90deg, #2dd4bf 1px, transparent 1px)',
            backgroundSize: '40px 40px'
        }}
      />

      <div className="relative w-full h-full flex items-center justify-center p-4">
        <svg className="w-full h-full max-w-[600px]" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Conexiones (Líneas) */}
          {edges.map((edge, i) => {
            const start = nodes[edge.from];
            const end = nodes[edge.to];
            const pathD = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
            
            return (
              <g key={`edge-${i}`}>
                {/* Línea base */}
                <motion.path
                  d={pathD}
                  stroke="#1e293b" // slate-800
                  strokeWidth={1}
                  fill="none"
                />
                
                {/* Línea de "Encendido" */}
                <motion.path
                  d={pathD}
                  stroke="#2dd4bf"
                  strokeWidth={1.5}
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{ 
                    duration: 1.5, 
                    delay: i * 0.05, // Efecto cascada
                    ease: "easeOut" 
                  }}
                />

                {/* Paquetes de datos (Tráfico) */}
                <DataPacket 
                    path={pathD} 
                    color="#ccfbf1" 
                    duration={3 / intensity} 
                    delay={Math.random() * 2} 
                />
                {/* Paquete reverso ocasional */}
                {i % 2 === 0 && (
                    <DataPacket 
                        path={`M ${end.x} ${end.y} L ${start.x} ${start.y}`} 
                        color="#2dd4bf" 
                        duration={4 / intensity} 
                        delay={Math.random() * 2 + 1} 
                    />
                )}
              </g>
            );
          })}

          {/* Nodos */}
          {nodes.map((node, i) => (
            <NodeIcon
              key={`node-${i}`}
              x={node.x}
              y={node.y}
              size={node.type === 'hub' ? 20 : (node.type === 'node' ? 16 : 12)}
              color={node.type === 'hub' ? '#f0fdfa' : '#2dd4bf'}
              delay={0.5 + (i * 0.1)}
            />
          ))}

        </svg>
      </div>
      
      {/* Overlay de texto sutil (Opcional, para dar contexto tecnológico) */}
      <div className="absolute bottom-4 right-4 text-teal-400/40 text-xs font-mono">
        NETWORK_STATUS: ACTIVE<br/>
        NODES: {nodes.length}<br/>
        THROUGHPUT: {(intensity * 100).toFixed(0)} MBPS
      </div>
    </div>
  );
}
