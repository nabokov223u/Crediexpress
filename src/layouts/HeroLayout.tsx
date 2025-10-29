import { ReactNode } from "react";
import { motion } from "framer-motion";
import "../index.css";

export default function HeroLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-trust">
      {/* Left Side: Cinematic Hero Image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full md:w-1/2 h-72 md:h-auto"
      >
        <img
          src="/hero.jpg"
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a0f50]/60 via-[#1a0f50]/40 to-transparent" />

        {/* Logo */}
        <motion.img
          src="/logo_light.png"
          alt="Logo"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute top-8 left-8 h-10 md:h-12"
        />

        {/* Text Overlay */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.9, ease: "easeOut" }}
          className="absolute inset-y-0 left-8 flex items-center text-white max-w-md"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-wider drop-shadow-lg mb-2 leading-tight">
              CREDIEXPRESS
            </h1>
            <p className="text-lg md:text-xl font-light drop-shadow-md">
              Tu sueño espera
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Right Side: Form Wizard */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 bg-white">
        <div className="w-full max-w-xl">{children}</div>
      </div>
    </div>
  );
}
