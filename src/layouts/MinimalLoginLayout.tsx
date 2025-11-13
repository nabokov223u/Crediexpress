import { ReactNode } from "react";
import { motion } from "framer-motion";
import Logo3D from "../components/Logo3D";

export default function MinimalLoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Patrón de fondo */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg width="100%" height="100%">
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="20" cy="20" r="1" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Elementos decorativos flotantes */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-brand/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-modern/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Contenedor principal */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-12 lg:gap-20 items-center">
          {/* Logo 3D */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex justify-center lg:justify-end"
          >
            <Logo3D />
          </motion.div>

          {/* Card del formulario */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-md mx-auto lg:mx-0"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.08)] border border-white/60 p-8 md:p-10">
              {children}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Soporte en esquina superior derecha */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute top-6 right-6 text-sm text-slate-500 hidden md:block"
      >
        ¿Necesitas ayuda?{" "}
        <a href="#" className="text-modern font-medium hover:underline">
          Soporte
        </a>
      </motion.div>
    </div>
  );
}
