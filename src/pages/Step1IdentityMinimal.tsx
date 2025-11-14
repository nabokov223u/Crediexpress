// src/pages/Step1IdentityMinimal.tsx
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { identitySchema } from "../utils/validators";
import Input from "../components/Input";
import { getDatosPorCedula } from "../services/cedula";
import { useFormData } from "../context/FormContext";

export default function Step1IdentityMinimal({ onNext }: { onNext: () => void }) {
  const { data, setData } = useFormData();
  const [showDetails, setShowDetails] = useState<boolean>(Boolean(data.applicant.fullName));
  const [loading, setLoading] = useState<boolean>(false);
  const [dataReady, setDataReady] = useState<boolean>(Boolean(data.applicant.fullName));
  const [acceptedPolicy, setAcceptedPolicy] = useState<boolean>(false);
  const [policyOpen, setPolicyOpen] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(identitySchema as any),
    defaultValues: {
      idNumber: data.applicant.idNumber,
      fullName: data.applicant.fullName,
      phone: (data.applicant as any).phone || "",
      email: (data.applicant as any).email || "",
      maritalStatus: data.applicant.maritalStatus,
      spouseId: data.applicant.spouseId,
    },
  });

  const idNumberValue = watch("idNumber");
  const lastIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!idNumberValue || !/^\d{10}$/.test(idNumberValue)) {
      setShowDetails(false);
      setDataReady(false);
      setAcceptedPolicy(false);
      return;
    }
    if (idNumberValue !== lastIdRef.current) {
      lastIdRef.current = idNumberValue;
      setShowDetails(false);
      setDataReady(false);
      setAcceptedPolicy(false);
    }
  }, [idNumberValue]);

  const fetchAndReveal = async () => {
    if (!idNumberValue || !/^\d{10}$/.test(idNumberValue)) {
      alert("Ingresa una cédula válida (10 dígitos)");
      return;
    }
    try {
      setLoading(true);
      const minDelay = new Promise((resolve) => setTimeout(resolve, 2000));
      const respPromise = getDatosPorCedula(idNumberValue);
      await Promise.all([respPromise, minDelay]);
      const resp = await respPromise;
      const full = resp.nombreCompleto?.trim() || [resp.nombres, resp.apellidos].filter(Boolean).join(" ").trim();
      if (full) {
        setValue("fullName", full, { shouldValidate: false, shouldDirty: true });
        if (!watch("maritalStatus")) setValue("maritalStatus", "single", { shouldDirty: true });
        setDataReady(true);
        setShowDetails(true);
      } else {
        setDataReady(false);
        setShowDetails(false);
        alert("No se pudieron obtener los datos de la cédula. Intenta nuevamente más tarde.");
      }
    } catch (e: any) {
      setDataReady(false);
      setShowDetails(false);
      alert("Hubo un problema al consultar el servicio. Por favor, inténtalo nuevamente más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const marital = watch("maritalStatus");
  const needsSpouse = marital === "married";

  const onSubmit = (v: any) => {
    setData({
      ...data,
      applicant: {
        idNumber: v.idNumber,
        fullName: v.fullName,
        phone: v.phone,
        email: v.email,
        maritalStatus: v.maritalStatus,
        spouseId: v.spouseId,
      },
    });
    onNext();
  };

  return (
    <motion.div layout transition={{ duration: 0.3, ease: "easeInOut" }} className="w-full">
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        {/* Header minimalista */}
        <div className="mb-8">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-3"
          >
            Bienvenido
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-slate-700 text-base md:text-lg"
          >
            Comencemos con tu cédula
          </motion.p>
        </div>

        {/* Input de cédula con diseño limpio */}
        <div>
          <Input
            label="Número de cédula"
            labelHidden
            placeholder="17123*****"
            register={register("idNumber")}
            error={errors.idNumber}
            className="h-14 text-center text-lg font-semibold border-2 focus:border-brand transition-all rounded-xl"
            readOnly={!!showDetails}
          />
        </div>

        {!showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Checkbox de política */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 rounded border-slate-300 text-brand focus:ring-brand transition-all"
                checked={acceptedPolicy}
                onChange={() => setPolicyOpen(true)}
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors leading-relaxed">
                Acepto la{" "}
                <button
                  type="button"
                  className="text-brand underline font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    setPolicyOpen(true);
                  }}
                >
                  política de uso de datos
                </button>
              </span>
            </label>

            {/* Botón continuar con gradiente sutil */}
            <motion.button
              type="button"
              disabled={!acceptedPolicy || loading}
              onClick={fetchAndReveal}
              className="w-full h-14 bg-gradient-to-r from-brand via-modern to-brand text-white rounded-xl font-bold text-lg shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 bg-[length:200%_100%]"
              style={{
                backgroundPosition: '0% 50%',
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
              whileHover={{ scale: acceptedPolicy && !loading ? 1.01 : 1 }}
              whileTap={{ scale: acceptedPolicy && !loading ? 0.98 : 1 }}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <motion.span
                    className="inline-block w-5 h-5 border-3 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Verificando...
                </span>
              ) : (
                "Continuar"
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Detalles expandibles */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              key="details"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-5 overflow-hidden"
            >
              <Input
                label="Nombre completo"
                placeholder="Tu nombre completo"
                register={register("fullName")}
                error={errors.fullName}
                className="h-13 rounded-xl text-base"
                readOnly
              />

              {/* Estado civil con diseño pill */}
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-3">
                  Estado civil
                </label>
                <div className="flex gap-3">
                  {[
                    ["single", "Soltero/a"],
                    ["married", "Casado/a"],
                  ].map(([val, label]) => (
                    <label
                      key={val}
                      className={`flex-1 h-13 flex items-center justify-center rounded-xl border-2 font-semibold text-base cursor-pointer transition-all ${
                        watch("maritalStatus") === val
                          ? "border-brand bg-brand/5 text-brand"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        value={val}
                        {...register("maritalStatus")}
                        className="hidden"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              {needsSpouse && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Input
                    label="Cédula del cónyuge"
                    placeholder="Ej: 0912345678"
                    register={{
                      ...register("spouseId"),
                      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                        // Solo números, máximo 10 dígitos
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        e.target.value = value;
                        register("spouseId").onChange(e);
                      }
                    }}
                    error={errors.spouseId}
                    className="h-13 rounded-xl text-base"
                  />
                </motion.div>
              )}

              {/* Contacto */}
              <div className="pt-3 space-y-4">
                <h3 className="text-sm font-bold text-slate-800">
                  Datos de contacto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Teléfono"
                    placeholder="+593 99 999 9999"
                    type="tel"
                    register={register("phone")}
                    error={errors.phone}
                    className="h-13 rounded-xl text-base"
                  />
                  <Input
                    label="Correo"
                    placeholder="tu@email.com"
                    type="email"
                    register={register("email")}
                    error={errors.email}
                    className="h-13 rounded-xl text-base"
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                className="w-full h-14 bg-gradient-to-r from-brand via-modern to-brand text-white rounded-xl font-bold text-lg shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/30 transition-all duration-300 bg-[length:200%_100%]"
                style={{
                  backgroundPosition: '0% 50%',
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                Confirmar y continuar
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Modal de política */}
      <AnimatePresence>
        {policyOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6"
            onClick={() => setPolicyOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-white/30"
            >
              <h3 className="text-xl font-bold text-brand mb-3">
                Política de uso de datos
              </h3>
              <div className="text-sm text-slate-600 space-y-2 max-h-60 overflow-auto pr-2">
                <p>
                  Autorizo a CrediExpress a tratar mis datos personales para la
                  gestión de la precalificación crediticia, validación de
                  identidad y análisis de riesgo.
                </p>
                <p>
                  La información podrá ser verificada con proveedores externos
                  para validar identidad y prevenir fraude.
                </p>
                <p>
                  Para más detalles, consulta nuestra Política de Privacidad completa.
                </p>
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  className="flex-1 h-11 rounded-xl border-2 border-slate-200 font-medium hover:bg-slate-50 transition-colors text-sm"
                  onClick={() => {
                    setAcceptedPolicy(false);
                    setPolicyOpen(false);
                  }}
                >
                  Rechazar
                </button>
                <button
                  type="button"
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-brand via-modern to-brand text-white font-semibold hover:shadow-lg transition-all text-sm bg-[length:200%_100%] animate-gradient"
                  style={{
                    animation: 'gradient 3s linear infinite',
                  }}
                  onClick={() => {
                    setAcceptedPolicy(true);
                    setPolicyOpen(false);
                    fetchAndReveal();
                  }}
                >
                  Aceptar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
