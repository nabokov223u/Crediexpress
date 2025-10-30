// src/pages/Step1Identity.tsx
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { identitySchema } from "../utils/validators";
import Input from "../components/Input";
import { getDatosPorCedula } from "../services/cedula";
import { useFormData } from "../context/FormContext";

export default function Step1Identity({ onNext }: { onNext: () => void }) {
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

  // ⚙️ Observa cambios en el campo "Cédula"
  const idNumberValue = watch("idNumber");
  const lastIdRef = useRef<string | null>(null);

  // Reinicia visualización y aceptación cuando cambia la cédula
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

  // Lógica para consultar datos solo tras aceptar política
  const fetchAndReveal = async () => {
    if (!idNumberValue || !/^\d{10}$/.test(idNumberValue)) {
      alert("Ingresa una cédula válida (10 dígitos)");
      return;
    }
    try {
      setLoading(true);
      // Espera mínima de 2s o lo que dure la consulta real, lo que sea mayor
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

  // ⚙️ Campos dependientes
  const marital = watch("maritalStatus");
  const needsSpouse = marital === "married";

  // 🧩 Envío del formulario
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

  // 🧠 Render del formulario
  return (
    <motion.div
      layout
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className={(showDetails ? "pt-2 " : "grid place-items-center min-h-[360px] ") + "relative"}
    >
    <form className="space-y-6 max-w-md mx-auto" onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-2">
        <h2 className="text-2xl font-semibold">Validación de identidad</h2>
        <p className="helper">Ingresa tu número de cédula para continuar</p>
      </div>

      <Input
        label="Cédula"
        labelHidden
        placeholder="Ingresa tu número de cédula"
        register={register("idNumber")}
        error={errors.idNumber}
        className={`h-12 ${showDetails ? "text-base" : "text-xl"}`}
        readOnly={!!showDetails}
      />

      {/* Aceptación de política de uso de datos (solo antes del despliegue) */}
      {!showDetails && (
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-slate-300 text-modern focus:ring-modern"
            checked={acceptedPolicy}
            onChange={() => setPolicyOpen(true)}
          />
          <label className="text-sm text-slate-600">
            Acepto la <button type="button" className="text-modern underline" onClick={() => setPolicyOpen(true)}>política de uso de datos</button>.
          </label>
        </div>
      )}


      <AnimatePresence initial={false}>
        {showDetails && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
          >
          <Input label="Nombre completo" labelHidden placeholder="Nombre completo" register={register("fullName")} error={errors.fullName} className="h-12" readOnly={!!showDetails} />

          <div>
            <label className="label">Estado civil</label>
            <div className="flex gap-3">
              {[
                ["single", "Soltero/a"],
                ["married", "Casado/a"],
              ].map(([val, label]) => (
                <label
                  key={val}
                  className={`h-11 min-w-[128px] px-5 inline-flex items-center justify-center rounded-xl border text-sm cursor-pointer ${
                    watch("maritalStatus") === val ? "border-modern bg-white" : "border-slate-200"
                  }`}
                >
                  <input type="radio" value={val} {...register("maritalStatus")} className="hidden" />
                  {label}
                </label>
              ))}
            </div>
            {errors.maritalStatus && <p className="error">{errors.maritalStatus.message as string}</p>}
          </div>

          {needsSpouse && (
            <Input label="Cédula del cónyuge" labelHidden placeholder="Cédula del cónyuge" register={register("spouseId")} error={errors.spouseId} className="h-12" />
          )}

          {/* Datos de contacto */}
          <div className="pt-4">
            <h3 className="label mb-2">Datos de contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Teléfono" placeholder="Ingresa tu teléfono" type="tel" register={register("phone") } error={errors.phone} className="h-12" required />
              <Input label="Correo electrónico" placeholder="Ingresa tu correo" type="email" register={register("email")} error={errors.email} className="h-12" required />
            </div>
            <p className="helper mt-2">Usaremos estos datos para informarte sobre tu precalificación. Nunca compartiremos tu información.</p>
          </div>

          <div className="pt-2">
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              Confirmo que estos datos son correctos
            </button>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>

    {/* Overlay loader between cedula entry and details reveal */}
    <AnimatePresence>
      {loading && (
        <motion.div
          key="overlay-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 z-10 bg-white/95 flex items-center justify-center"
        >
          <motion.img
            src="/logo_icon.png"
            alt="Cargando"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-20 w-20 md:h-24 md:w-24"
          />
        </motion.div>
      )}
    </AnimatePresence>

    {/* Policy modal */}
    <AnimatePresence>
      {policyOpen && (
        <motion.div
          key="policy-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-xl w-[92%] max-w-lg p-5"
          >
            <h3 className="text-lg font-semibold mb-2">Política de uso de datos</h3>
            <div className="text-sm text-slate-600 max-h-56 overflow-auto space-y-2">
              <p>Autorizo a CrediExpress a tratar mis datos personales para la gestión de la precalificación crediticia, validación de identidad y análisis de riesgo, de acuerdo con la normativa aplicable.</p>
              <p>La información podrá ser verificada con proveedores externos para validar identidad y prevenir fraude. Podré solicitar la rectificación o eliminación de mis datos según corresponda.</p>
              <p>Para más detalles, consulta nuestra Política de Privacidad completa.</p>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => { setAcceptedPolicy(false); setPolicyOpen(false); setShowDetails(false); }}
              >
                No aceptar
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => { setAcceptedPolicy(true); setPolicyOpen(false); fetchAndReveal(); }}
              >
                Aceptar y continuar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </motion.div>
  );
}
