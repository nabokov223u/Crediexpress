import { ReactNode } from "react";
import { motion } from "framer-motion";
import "../index.css";

export default function HeroLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-background">
      {/* Left: Photo (reduced footprint, kept animations) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative hidden sm:block w-full md:w-4/12 h-48 md:h-auto"
      >
        <img src="/hero.jpg" alt="Hero" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a0f50]/60 via-[#1a0f50]/40 to-transparent" />

        {/* Logo */}
        <motion.img
          src="/logo_light.png"
          alt="Logo"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="absolute top-6 left-6 h-9 md:h-10"
        />

        {/* Minimal marketing copy (optional) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.7, ease: "easeOut" }}
          className="absolute bottom-8 left-6 text-white max-w-sm"
        >
          <p className="text-xl md:text-2xl font-semibold">Financia tu vehículo con confianza</p>
        </motion.div>
      </motion.div>

      {/* Right: Minimal form column */}
  <div className="relative flex-1 bg-white text-ink">
        {/* Top-right support */}
        <div className="absolute top-6 right-6 text-sm text-slate-500">
          ¿Ya eres cliente? <a href="#" className="text-modern font-medium hover:underline">Soporte</a>
        </div>

        {/* Centered content */}
        <div className="min-h-screen md:min-h-0 md:h-full flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>

        {/* Bottom disclaimer */}
        <div className="absolute inset-x-0 bottom-4 px-6 text-center text-xs text-slate-500">
          Protegido por servicios de seguridad y sujeto a nuestras
          {" "}
          <a href="#" className="underline hover:text-slate-700">Política de Privacidad</a>
          {" "}y{ " "}
          <a href="#" className="underline hover:text-slate-700">Términos de Servicio</a>.
        </div>
      </div>
    </div>
  );
}
