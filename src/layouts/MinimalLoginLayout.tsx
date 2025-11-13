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
          className="w-full max-w-7xl"
        >
          {/* Card principal */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-[42%_58%] min-h-[700px]">
              {/* Columna izquierda - Logo y contenido informativo */}
              <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 p-10 md:p-12 flex flex-col justify-between">
                {/* Contenido superior */}
                <div className="flex-1 flex flex-col items-center justify-center">
                  {/* Logo animado grande */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative mb-8"
                  >
                    <motion.img
                      src="/logo_3d.png"
                      alt="Originarsa"
                      className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 object-contain drop-shadow-2xl"
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
                    className="text-center hidden lg:block mb-8"
                  >
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">
                      CrediExpress
                    </h3>
                    <p className="text-base text-slate-700 mb-6">
                      Tu crédito automotriz en minutos
                    </p>
                  </motion.div>

                  {/* Features/Beneficios */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="hidden lg:block w-full max-w-xs space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-brand" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">Proceso 100% digital</p>
                        <p className="text-xs text-slate-600">Sin papeleo ni visitas</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-brand" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">Respuesta inmediata</p>
                        <p className="text-xs text-slate-600">Conoce tu precalificación al instante</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-brand" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">Datos seguros</p>
                        <p className="text-xs text-slate-600">Encriptación de nivel bancario</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Columna derecha - Formulario */}
              <div className="p-10 md:p-14 flex flex-col justify-between">
                <div className="flex-1 flex items-center">
                  {children}
                </div>

                {/* Footer con disclaimer y copyright */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="border-t border-slate-200 pt-6 mt-6 space-y-4"
                >
                  {/* Disclaimer */}
                  <div className="text-xs text-slate-600 leading-relaxed">
                    <p className="mb-2">
                      <span className="font-semibold text-slate-700">🔒 Política de Privacidad:</span> Tus datos están protegidos y solo serán usados para el proceso de precalificación crediticia.
                    </p>
                    <p>
                      Al continuar, aceptas nuestros <a href="#" className="text-brand hover:underline font-medium">términos y condiciones</a>.
                    </p>
                  </div>

                  {/* Copyright */}
                  <div className="text-xs text-slate-500 pt-2">
                    <p>© 2025 Originarsa. Todos los derechos reservados.</p>
                  </div>
                </motion.div>
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
