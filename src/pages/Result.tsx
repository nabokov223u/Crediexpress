import { motion } from 'framer-motion';
import { FaWhatsapp, FaCheckCircle, FaClock, FaTimesCircle, FaPrint, FaShareAlt } from 'react-icons/fa';
import { useFormData } from '../context/FormContext';

export default function Result({ status, onRestart }: { status: "approved" | "review" | "denied"; onRestart: () => void; }) {
  const { data } = useFormData();
  
  // Configuración por estado
  const config = {
    approved: {
      color: "green",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      icon: <FaCheckCircle className="text-6xl text-emerald-500" />,
      title: "CRÉDITO PREAPROBADO",
      subtitle: "Tu solicitud ha sido preaprobada",
      message: "Hemos verificado tu perfil y cuentas con un cupo preaprobado. Un asesor se comunicará contigo para completar la documentación requerida.",
      cta: "CONTACTAR A MI ASESOR",
      ctaColor: "bg-emerald-600 hover:bg-emerald-700",
      urgency: "Esta preaprobación tiene vigencia de 24 horas.",
      legal: "*Sujeto a verificación documental y aprobación final. Esta preaprobación no constituye una oferta vinculante de crédito."
    },
    review: {
      color: "blue",
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: <FaClock className="text-6xl text-blue-500" />,
      title: "SOLICITUD EN REVISIÓN",
      subtitle: "Tu solicitud está siendo evaluada",
      message: "Tu caso requiere una verificación adicional por parte de nuestro equipo. Te contactaremos con una respuesta a la brevedad.",
      cta: "HABLAR CON UN ASESOR",
      ctaColor: "bg-blue-600 hover:bg-blue-700",
      urgency: "Tiempo de respuesta estimado: 24 a 48 horas.",
      legal: ""
    },
    denied: {
      color: "gray",
      bg: "bg-gray-50",
      border: "border-gray-200",
      icon: <FaTimesCircle className="text-6xl text-gray-400" />,
      title: "SOLICITUD NO APROBADA",
      subtitle: "Tu solicitud no cumple los requisitos en este momento",
      message: "Actualmente no fue posible aprobar tu solicitud. Puedes contactar a un asesor para conocer alternativas de financiamiento.",
      cta: "CONSULTAR ALTERNATIVAS",
      ctaColor: "bg-gray-700 hover:bg-gray-800",
      urgency: "",
      legal: ""
    }
  };

  const current = config[status];
  const whatsappLink = `https://wa.me/593997424404?text=Hola, acabo de precalificar en CrediExpress. Mi nombre es ${data.applicant.fullName} y mi estado es: ${status.toUpperCase()}`;

  return (
    <div className="w-full flex items-center justify-center">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className={`relative w-full max-w-lg ${current.bg} rounded-2xl shadow-lg overflow-hidden border ${current.border}`}
      >
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm p-6 border-b border-gray-200 flex flex-col items-center text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="mb-4 drop-shadow-lg"
          >
            {current.icon}
          </motion.div>
          <h2 className={`text-2xl md:text-3xl font-black tracking-tight text-gray-800 uppercase`}>
            {current.title}
          </h2>
          <p className={`font-medium text-lg mt-1 text-${current.color}-700`}>
            {current.subtitle}
          </p>
        </div>

        {/* Body */}
        <div className="p-8 text-center space-y-6">
          <div className="bg-white/50 rounded-xl p-4 shadow-inner">
            <p className="text-gray-700 text-lg leading-relaxed">
              Hola <strong>{data.applicant.fullName.split(' ')[0]}</strong>, <br/>
              {current.message}
            </p>
          </div>

          {/* Urgency Banner */}
          {current.urgency && (
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 py-2 px-4 rounded-lg">
              {current.urgency}
            </div>
          )}

          {/* Primary CTA - WhatsApp */}
          {status !== 'denied' && (
            <motion.a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center justify-center gap-3 w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg shadow-${current.color}-500/30 ${current.ctaColor} transition-all`}
            >
              <FaWhatsapp className="text-2xl" />
              {current.cta}
            </motion.a>
          )}

          {/* Secondary Actions */}
          <div className="flex justify-center gap-4 pt-2">
            <button onClick={() => window.print()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors">
              <FaPrint /> Guardar Comprobante
            </button>
            <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors">
              <FaShareAlt /> Compartir
            </button>
          </div>
        </div>

        {/* Legal Disclaimer */}
        {current.legal && (
          <div className="px-8 pb-2">
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              {current.legal}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-200 text-center">
          <button onClick={onRestart} className="text-gray-400 hover:text-gray-600 text-sm underline">
            Iniciar nueva solicitud
          </button>
          <p className="text-xs text-gray-300 mt-2">ID de Solicitud: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
        </div>
      </motion.div>
    </div>
  );
}