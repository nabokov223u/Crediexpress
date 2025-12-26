import { ReactNode } from "react";
import { motion } from "framer-motion";
import AnimatedCheckIcon from "../components/AnimatedCheckIcon";
import { useState, useEffect } from "react";

interface MinimalLoginLayoutProps {
  children: ReactNode;
  backgroundImage?: string;
  currentStep?: number;
  totalSteps?: number;
  identityExpanded?: boolean;
}

export default function MinimalLoginLayout({ 
  children, 
  backgroundImage = "/hero.jpg",
  currentStep = 1,
  totalSteps = 3,
  identityExpanded = false
}: MinimalLoginLayoutProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [clickCount, setClickCount] = useState(0);
  const [showSecret, setShowSecret] = useState(false);
  const [konamiIndex, setKonamiIndex] = useState(0);
  const [logoParallax, setLogoParallax] = useState({ x: 0, y: 0 });
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

  // Konami code detector
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === konamiCode[konamiIndex]) {
        const newIndex = konamiIndex + 1;
        setKonamiIndex(newIndex);
        if (newIndex === konamiCode.length) {
          setShowSecret(true);
          setKonamiIndex(0);
          setTimeout(() => setShowSecret(false), 5000);
        }
      } else {
        setKonamiIndex(0);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [konamiIndex]);

  // Triple click handler
  const handleLogoClick = () => {
    setClickCount(prev => prev + 1);
    if (clickCount === 2) {
      setShowSecret(true);
      setClickCount(0);
      setTimeout(() => setShowSecret(false), 5000);
    }
    setTimeout(() => setClickCount(0), 1000);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
    
    // Parallax para el logo (movimiento sutil)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const moveX = (x - centerX) / 50;
    const moveY = (y - centerY) / 50;
    setLogoParallax({ x: moveX, y: moveY });
  };

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
        
        {/* Patrón animado más evidente pero más lento */}
        <motion.div
          className="absolute inset-0 opacity-[0.15]"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 40, // Aumentado de 15 a 40 segundos
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear',
          }}
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.9) 3px, transparent 3px),
              radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.7) 2px, transparent 2px),
              radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.5) 1.5px, transparent 1.5px)
            `,
            backgroundSize: '70px 70px, 50px 50px, 35px 35px',
          }}
        />
        
        {/* Elementos decorativos adicionales */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-modern/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Contenedor principal centrado */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 md:p-6">
        {/* Card grande dividido en dos columnas */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-6xl"
        >
          {/* Card principal */}
          <div 
            className="bg-white rounded-3xl shadow-2xl overflow-hidden transition-shadow duration-200"
            onMouseMove={handleMouseMove}
            style={{
              boxShadow: `
                0 20px 60px rgba(0, 0, 0, 0.15),
                ${mousePosition.x * 0.05}px ${mousePosition.y * 0.05}px 80px -40px rgba(26, 15, 80, 0.12),
                ${mousePosition.x * 0.03}px ${mousePosition.y * 0.03}px 50px -20px rgba(7, 99, 253, 0.08)
              `,
            }}
          >            <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] min-h-[650px]">
              {/* Columna izquierda - Logo y contenido informativo */}
              <div className="relative bg-[#0d234a] p-10 md:p-12 flex flex-col justify-between overflow-hidden">
                {/* Contenido superior */}
                <div className="flex-1 flex flex-col items-center justify-center">
                  {/* Logo animado grande */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative mb-8 cursor-pointer"
                    onClick={handleLogoClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.img
                      key={identityExpanded ? "expanded" : "default"}
                      src={identityExpanded ? "/step2_data.png" : "/logo_menta_3d.png"}
                      alt="Originarsa"
                      className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 object-contain drop-shadow-2xl"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        y: [-10 + logoParallax.y, 10 + logoParallax.y, -10 + logoParallax.y],
                        x: logoParallax.x,
                        rotateY: [logoParallax.x * 2, 5 + logoParallax.x * 2, logoParallax.x * 2, -5 + logoParallax.x * 2, logoParallax.x * 2],
                        rotateX: -logoParallax.y * 2,
                      }}
                      transition={{
                        opacity: { duration: 0.5 },
                        scale: { duration: 0.5 },
                        y: {
                          duration: 6,
                          repeat: Infinity,
                          ease: "easeInOut",
                        },
                        x: {
                          type: "spring",
                          stiffness: 150,
                          damping: 15,
                        },
                        rotateY: {
                          duration: 6,
                          repeat: Infinity,
                          ease: "easeInOut",
                        },
                        rotateX: {
                          type: "spring",
                          stiffness: 150,
                          damping: 15,
                        },
                      }}
                      style={{
                        transformStyle: "preserve-3d",
                      }}
                    />
                    
                    {/* Glow effect */}
                    <motion.div
                      className="absolute inset-0 -z-10 rounded-full bg-teal-400/20 blur-3xl"
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

                  {/* Mensaje secreto de easter egg */}
                  {showSecret && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, y: -20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="absolute top-4 right-4 bg-gradient-to-r from-brand to-modern text-white px-4 py-2 rounded-lg shadow-xl text-sm font-bold z-50"
                    >
                      🎉 ¡Secreto descubierto! 🎉
                    </motion.div>
                  )}

                  {/* Texto descriptivo */}
                  <motion.div
                    key={identityExpanded ? "text-expanded" : "text-default"}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-center hidden lg:block mb-8"
                  >
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {identityExpanded ? "Queremos conocerte" : "Tu auto nuevo está cerca"}
                    </h3>
                    <p className="text-base text-slate-300 mb-6">
                      {identityExpanded 
                        ? "Para brindarte la mejor oferta crediticia, necesitamos validar quién eres."
                        : "Precalifica en minutos siguiendo estos pasos:"
                      }
                    </p>
                  </motion.div>

                  {/* Features/Beneficios */}
                  <motion.div
                    key={identityExpanded ? "features-expanded" : "features-default"}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="hidden lg:block w-full max-w-xs space-y-4"
                  >
                    {identityExpanded ? (
                      <>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">Tu seguridad es primero</p>
                            <p className="text-xs text-slate-400">Utilizamos encriptación de alto nivel para proteger tu información.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">Validación precisa</p>
                            <p className="text-xs text-slate-400">Estos datos solo servirán para calcular tu capacidad de pago real.</p>
                          </div>
                        </div>
                        
                        <div className="pt-4 text-center">
                          <p className="text-sm text-teal-400 font-medium">
                            ¡Ya falta poco!
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-teal-400 font-bold text-sm">1</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">Datos</p>
                            <p className="text-xs text-slate-400">Ingresa tu información básica.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-teal-400 font-bold text-sm">2</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">Cotización</p>
                            <p className="text-xs text-slate-400">Ajusta tu plan de pagos.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-teal-400 font-bold text-sm">3</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">Resultado</p>
                            <p className="text-xs text-slate-400">Recibe respuesta inmediata.</p>
                          </div>
                        </div>
                        
                        <div className="pt-4 text-center">
                          <p className="text-sm text-teal-400 font-medium">
                            Ingresa tu cédula para comenzar.
                          </p>
                        </div>
                      </>
                    )}
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
            {/* Barra de progreso con glassmorphism */}
            <div className="flex items-center gap-2">
              <div className="w-48 md:w-64 h-2.5 bg-white/30 backdrop-blur-md rounded-full overflow-hidden border border-white/20">
                <motion.div
                  className="h-full bg-white rounded-full shadow-lg"
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

      {/* Texto de soporte */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="fixed bottom-6 right-6 z-50 text-sm text-white/90"
      >
        ¿Necesitas ayuda?{" "}
        <a 
          href="https://wa.me/593999999999?text=Hola,%20necesito%20ayuda%20con%20mi%20precalificación"
          target="_blank"
          rel="noopener noreferrer"
          className="text-modern font-semibold hover:text-white transition-colors duration-300 hover:underline"
        >
          Contacta a un asesor
        </a>
      </motion.div>
    </div>
  );
}
