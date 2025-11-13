import { ReactNode } from "react";
import { motion } from "framer-motion";

interface MinimalLoginLayoutProps {
  children: ReactNode;
  backgroundImage?: string;
  currentStep?: number;
  totalSteps?: number;
}

export default function MinimalLoginLayout({ 
  children, 
  backgroundImage = "/hero.jpg",
  currentStep = 1,
  totalSteps = 3
}: MinimalLoginLayoutProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo con imagen difuminada */}
      <div className="absolute inset-0">
        <img
          src={backgroundImage}
          alt="Background"
          className="w-full h-full object-cover"
        />
        {/* Overlay de blur y oscurecimiento */}
        <div className="absolute inset-0 backdrop-blur-2xl bg-slate-900/40" />
      </div>

      {/* Contenedor principal centrado */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 md:p-6">
        {/* Card grande dividido en dos columnas */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-5xl"
        >
          {/* Card principal */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] min-h-[600px]">
              {/* Columna izquierda - Logo y decoración */}
              <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 p-8 md:p-12 flex flex-col items-center justify-center">
                {/* Logo animado grande */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative"
                >
                  <motion.img
                    src="/logo_3d.png"
                    alt="Originarsa"
                    className="w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 object-contain drop-shadow-2xl"
                    animate={{
                      y: [-10, 10, -10],
                      rotateY: [0, 5, 0, -5, 0],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  
                  {/* Glow effect */}
                  <motion.div
                    className="absolute inset-0 -z-10 rounded-full bg-brand/20 blur-3xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>

                {/* Texto descriptivo */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mt-8 text-center hidden lg:block"
                >
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    CrediExpress
                  </h3>
                  <p className="text-sm text-slate-600">
                    Tu crédito automotriz en minutos
                  </p>
                </motion.div>
              </div>

              {/* Columna derecha - Formulario */}
              <div className="p-8 md:p-12 flex flex-col">
                <div className="flex-1 flex items-center">
                  {children}
                </div>
              </div>
            </div>
          </div>

          {/* Navegación de pasos (debajo del card) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 flex items-center justify-center gap-4"
          >
            {/* Barra de progreso */}
            <div className="flex items-center gap-2">
              <div className="w-32 md:w-48 h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <span className="text-white text-sm font-medium">
                {currentStep} de {totalSteps}
              </span>
            </div>

            {/* Botón cerrar */}
            <button
              className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors flex items-center justify-center text-white"
              onClick={() => window.location.reload()}
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Soporte en esquina superior derecha */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute top-6 right-6 text-sm text-white/80 hidden md:block"
      >
        ¿Necesitas ayuda?{" "}
        <a href="#" className="text-white font-medium hover:underline">
          Soporte
        </a>
      </motion.div>
    </div>
  );
}
