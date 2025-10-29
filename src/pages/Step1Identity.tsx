// src/pages/Step1Identity.tsx
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { identitySchema } from "../utils/validators";
import Input from "../components/Input";
import { getDatosPorCedula } from "../services/cedula";
import { useFormData } from "../context/FormContext";

export default function Step1Identity({ onNext }: { onNext: () => void }) {
  const { data, setData } = useFormData();

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
      if (!idNumberValue || !/^\d{10}$/.test(idNumberValue)) return;
      if (idNumberValue === lastIdRef.current) return;
      lastIdRef.current = idNumberValue;

      try {
        console.log("Consultando API de cédula...", idNumberValue);
        const data = await getDatosPorCedula(idNumberValue);
        console.log("Respuesta API:", data);

        const full =
          data.nombreCompleto?.trim() ||
          [data.nombres, data.apellidos].filter(Boolean).join(" ").trim();

        if (full) {
          setValue("fullName", full, { shouldValidate: true, shouldDirty: true });
        } else {
          console.warn("No se encontraron nombres válidos en la respuesta:", data);
          alert("No se pudieron obtener los datos de la cédula. Intenta nuevamente más tarde.");
        }
      } catch (e: any) {
        console.error("Error al autocompletar cédula:", e.message || e);
        alert("Hubo un problema al consultar el servicio. Por favor, inténtalo nuevamente más tarde.");
      }
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
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <Input label="Cédula" register={register("idNumber")} error={errors.idNumber} />
      <Input label="Nombre completo" register={register("fullName")} error={errors.fullName} />

      <div>
        <label className="label">Estado civil</label>
        <div className="flex gap-2">
          {[
            ["single", "Soltero/a"],
            ["married", "Casado/a"],
          ].map(([val, label]) => (
            <label
              key={val}
              className={`px-3 py-2 rounded-xl border text-sm cursor-pointer ${
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
        <Input label="Cédula del cónyuge" register={register("spouseId")} error={errors.spouseId} />
      )}

      <div className="flex justify-end">
        <button type="submit" className="btn-primary">
          Siguiente
        </button>
      </div>
    </form>
  );
}
