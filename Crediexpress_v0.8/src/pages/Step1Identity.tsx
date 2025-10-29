import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { identitySchema } from "../utils/validators";
import Input from "../components/Input";
import { useEffect } from "react";
import { getDatosPorCedula } from "../services/cedula";
import { useFormData } from "../context/FormContext";

export default function Step1Identity({ onNext }:{ onNext:()=>void }){
  const { data, setData } = useFormData();
  const { register, handleSubmit, watch, setValue, formState:{ errors } } = useForm<any>({
    resolver: zodResolver(identitySchema as any),
    defaultValues: { idNumber: data.applicant.idNumber, fullName: data.applicant.fullName, maritalStatus: data.applicant.maritalStatus, spouseId: data.applicant.spouseId }
  });
  
// Autocompletar nombres al detectar cédula de 10 dígitos
const idNumberValue = watch("idNumber");
useEffect(() => {
  const run = async () => {
    try {
      if (idNumberValue && /^\d{10}$/.test(idNumberValue)) {
        const data = await getDatosPorCedula(idNumberValue);
        const full = [data.nombres, data.apellidos].filter(Boolean).join(" ").trim();
        if (full) setValue("fullName", full, { shouldValidate: true, shouldDirty: true });
      }
    } catch (e) {
      // Silencioso: el UI de errores del formulario se mantiene
      console.warn("No se pudo autocompletar desde API cédula:", e);
    }
  };
  run();
}, [idNumberValue, setValue]);

  const marital = watch("maritalStatus"); const needsSpouse = marital === "married";
  const onSubmit = (v:any)=>{ setData({ ...data, applicant:{ idNumber:v.idNumber, fullName:v.fullName, maritalStatus:v.maritalStatus, spouseId:v.spouseId }}); onNext(); };
  return (<form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
    <Input label="Cédula" register={register("idNumber")} error={errors.idNumber} />
    <Input label="Nombre completo" register={register("fullName")} error={errors.fullName} />
    <div><label className="label">Estado civil</label><div className="flex gap-2">
      {[["single","Soltero/a"],["married","Casado/a"]].map(([val,label])=>(
        <label key={val} className={`px-3 py-2 rounded-xl border text-sm cursor-pointer ${watch("maritalStatus")===val ? "border-modern bg-white":"border-slate-200"}`}>
          <input type="radio" value={val} {...register("maritalStatus")} className="hidden"/>{label}
        </label>
      ))}
    </div>{errors.maritalStatus && <p className="error">{errors.maritalStatus.message as string}</p>}</div>
    {needsSpouse && <Input label="Cédula del cónyuge" register={register("spouseId")} error={errors.spouseId} />}
    <div className="flex justify-end"><button type="submit" className="btn-primary">Siguiente</button></div>
  </form>);
}