import { motion } from "framer-motion";
import AnimatedCheckIcon from "../components/AnimatedCheckIcon";
import { useEffect } from "react";
import confetti from "canvas-confetti";

interface ResultMinimalProps {
  status: "approved" | "review" | "denied";
  onRestart: () => void;
}

export default function ResultMinimal({ status, onRestart }: ResultMinimalProps) {
  // Efecto confetti sutil para aprobación
  useEffect(() => {
    if (status === "approved") {
      // Confetti más sutil y corto
      const duration = 2000; // Reducido de 3000 a 2000ms
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 1, // Reducido de 2 a 1
          angle: 60,
          spread: 45, // Reducido de 55 a 45
          origin: { x: 0, y: 0.6 },
          colors: ['#1a0f50', '#0763fd', '#10b981'],
          startVelocity: 25, // Velocidad reducida
          gravity: 0.8, // Gravedad aumentada para caída más rápida
        });
        confetti({
          particleCount: 1, // Reducido de 2 a 1
          angle: 120,
          spread: 45, // Reducido de 55 a 45
          origin: { x: 1, y: 0.6 },
          colors: ['#1a0f50', '#0763fd', '#10b981'],
          startVelocity: 25,
          gravity: 0.8,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      // Delay inicial para sincronizar con animación
      setTimeout(() => frame(), 800);

      // Confetti burst inicial más sutil
      setTimeout(() => {
        confetti({
          particleCount: 50, // Reducido de 100 a 50
          spread: 60, // Reducido de 70 a 60
          origin: { y: 0.6 },
          colors: ['#1a0f50', '#0763fd', '#10b981', '#ffffff'],
          startVelocity: 30,
          gravity: 0.8,
        });
      }, 400);
    }
  }, [status]);

  const config = {
    approved: {
      title: "¡Felicitaciones!",
      subtitle: "Tu crédito fue preaprobado",
      description: "Nuestro equipo se comunicará contigo en las próximas horas para completar el proceso y coordinar la entrega de tu vehículo.",
      icon: <AnimatedCheckIcon className="w-24 h-24 text-green-500" />,
      gradient: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      textColor: "text-green-900",
      iconBg: "bg-green-100",
    },
    review: {
      title: "En análisis",
      subtitle: "Estamos revisando tu solicitud",
      description: "Tu solicitud está siendo evaluada por nuestro equipo. Te contactaremos pronto con una respuesta. Este proceso puede tomar entre 24 a 48 horas.",
      icon: <div className="w-24 h-24 text-blue-500 text-7xl flex items-center justify-center">🕓</div>,
      gradient: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-900",
      iconBg: "bg-blue-100",
    },
    denied: {
      title: "No aprobado",
      subtitle: "Tu solicitud no fue aprobada",
      description: "Por el momento no cumples con todos los requisitos necesarios. Puedes volver a intentarlo más adelante o contactarnos para conocer otras opciones de financiamiento.",
      icon: "❌",
      gradient: "from-red-500 to-rose-600",
      bgColor: "bg-red-50",
      textColor: "text-red-900",
      iconBg: "bg-red-100",
    },
  };

  const cfg = config[status];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full flex flex-col items-center justify-center min-h-[500px]"
    >
      {/* Icono grande animado con efecto dramático */}
      <motion.div
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={{ 
          scale: [0, 1.2, 0.9, 1.05, 1],
          rotate: [-180, 20, -10, 5, 0],
          opacity: 1
        }}
        transition={{ 
          duration: 0.8,
          times: [0, 0.4, 0.6, 0.8, 1],
          ease: "easeOut",
          delay: 0.1 
        }}
        className="mb-6"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
      >
        {cfg.icon}
      </motion.div>

      {/* Título principal con animación dramática */}
      <motion.h2
        initial={{ opacity: 0, y: 30, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.6, 
          delay: 0.3,
          type: "spring",
          stiffness: 200
        }}
        className={`text-4xl md:text-5xl font-bold mb-3 text-center bg-gradient-to-r ${cfg.gradient} bg-clip-text text-transparent`}
      >
        {cfg.title}
      </motion.h2>

      {/* Subtítulo con efecto de entrada */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          delay: 0.5,
          duration: 0.5,
          type: "spring",
          stiffness: 100
        }}
        className="text-xl md:text-2xl text-slate-700 mb-6 text-center"
      >
        {cfg.subtitle}
      </motion.p>

      {/* Descripción con efecto stagger */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          delay: 0.7,
          duration: 0.5,
          type: "spring",
          stiffness: 150
        }}
        className={`${cfg.bgColor} rounded-2xl p-6 max-w-lg mb-8 border-2 ${cfg.bgColor} shadow-lg`}
        whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
      >
        <p className={`text-base ${cfg.textColor} leading-relaxed text-center`}>
          {cfg.description}
        </p>
      </motion.div>

      {/* Información adicional para aprobados con animaciones stagger */}
      {status === "approved" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl mb-8"
        >
          {[1, 2, 3].map((index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                delay: 0.9 + index * 0.1,
                type: "spring",
                stiffness: 150
              }}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                y: -5
              }}
              className="bg-white/80 backdrop-blur-md rounded-xl p-4 border border-slate-200/50 text-center shadow-sm cursor-pointer"
            >
              <p className="text-xs font-medium text-slate-600 mb-1">
                {index === 1 ? "Próximo paso" : index === 2 ? "Tiempo estimado" : "Contacto"}
              </p>
              <p className="text-sm font-bold text-slate-900">
                {index === 1 ? "Verificación de documentos" : index === 2 ? "24-48 horas" : "Vía email o teléfono"}
              </p>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Botones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col sm:flex-row gap-4 w-full max-w-md"
      >
        <motion.button
          onClick={onRestart}
          className="flex-1 h-14 rounded-xl border-2 border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition-all text-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Volver al inicio
        </motion.button>
        <motion.a
          href="#"
          className="flex-1 h-14 bg-gradient-to-r from-brand to-modern text-white rounded-xl font-bold text-lg shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/30 transition-all duration-300 flex items-center justify-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Contactar con asesor
        </motion.a>
      </motion.div>
    </motion.div>
  );
}
