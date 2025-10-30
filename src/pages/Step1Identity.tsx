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
      maritalStatus: data.applicant.maritalStatus,
      spouseId: data.applicant.spouseId,
    },
  });

  // ⚙️ Observa cambios en el campo "Cédula"
  const idNumberValue = watch("idNumber");
  const lastIdRef = useRef<string | null>(null);

  useEffect(() => {
    const run = async () => {
      // Evita consultas duplicadas o incompletas
      if (!idNumberValue || !/^\d{10}$/.test(idNumberValue)) { setShowDetails(false); return; }
      if (idNumberValue === lastIdRef.current) return;
      lastIdRef.current = idNumberValue;

      try {
        setLoading(true);
        console.log("Consultando API de cédula...", idNumberValue);
        const data = await getDatosPorCedula(idNumberValue);
        console.log("Respuesta API:", data);

        const full =
          data.nombreCompleto?.trim() ||
          [data.nombres, data.apellidos].filter(Boolean).join(" ").trim();

        if (full) {
          setValue("fullName", full, { shouldValidate: false, shouldDirty: true });
          if (!watch("maritalStatus")) setValue("maritalStatus", "single", { shouldDirty: true });
          setShowDetails(true);
        } else {
          console.warn("No se encontraron nombres válidos en la respuesta:", data);
          setShowDetails(false);
          alert("No se pudieron obtener los datos de la cédula. Intenta nuevamente más tarde.");
        }
      } catch (e: any) {
        console.error("Error al autocompletar cédula:", e.message || e);
        setShowDetails(false);
        alert("Hubo un problema al consultar el servicio. Por favor, inténtalo nuevamente más tarde.");
      } finally { setLoading(false); }
    };
    run();
  }, [idNumberValue, setValue]);

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
        maritalStatus: v.maritalStatus,
        spouseId: v.spouseId,
      },
    });
    onNext();
  };

  // 🧠 Render del formulario
  return (
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
      />

      {loading && (
        <div className="flex items-center gap-3 text-white/90">
          <img src="/logo_icon.png" alt="Cargando" className="h-8 w-8 animate-pulse" />
          <span className="text-sm">Buscando datos…</span>
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
          <Input label="Nombre completo" labelHidden placeholder="Nombre completo" register={register("fullName")} error={errors.fullName} className="h-12" />

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

          <div className="pt-2">
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              Confirmo que estos datos son correctos
            </button>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
