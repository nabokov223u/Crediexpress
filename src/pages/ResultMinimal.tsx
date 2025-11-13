import { motion } from "framer-motion";
import AnimatedCheckIcon from "../components/AnimatedCheckIcon";

interface ResultMinimalProps {
  status: "approved" | "review" | "denied";
  onRestart: () => void;
}

export default function ResultMinimal({ status, onRestart }: ResultMinimalProps) {
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
      {/* Icono grande animado */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.1 
        }}
        className="mb-6"
      >
        {cfg.icon}
      </motion.div>

      {/* Título principal */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-4xl md:text-5xl font-bold text-slate-900 mb-3 text-center"
      >
        {cfg.title}
      </motion.h2>

      {/* Subtítulo */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-xl md:text-2xl text-slate-700 mb-6 text-center"
      >
        {cfg.subtitle}
      </motion.p>

      {/* Descripción */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`${cfg.bgColor} rounded-2xl p-6 max-w-lg mb-8 border-2 ${cfg.bgColor}`}
      >
        <p className={`text-base ${cfg.textColor} leading-relaxed text-center`}>
          {cfg.description}
        </p>
      </motion.div>

      {/* Información adicional para aprobados */}
      {status === "approved" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl mb-8"
        >
          <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 border border-slate-200/50 text-center shadow-sm">
            <p className="text-xs font-medium text-slate-600 mb-1">Próximo paso</p>
            <p className="text-sm font-bold text-slate-900">Verificación de documentos</p>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 border border-slate-200/50 text-center shadow-sm">
            <p className="text-xs font-medium text-slate-600 mb-1">Tiempo estimado</p>
            <p className="text-sm font-bold text-slate-900">24-48 horas</p>
          </div>
          <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 border border-slate-200/50 text-center shadow-sm">
            <p className="text-xs font-medium text-slate-600 mb-1">Contacto</p>
            <p className="text-sm font-bold text-slate-900">Vía email o teléfono</p>
          </div>
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
          Contactar soporte
        </motion.a>
      </motion.div>
    </motion.div>
  );
}
