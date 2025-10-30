import type { FieldError, FieldErrorsImpl, Merge } from "react-hook-form";

type FieldErrorLike = FieldError | Merge<FieldError, FieldErrorsImpl<any>>;

export default function Input({ label, type = "text", placeholder, register, error, className, labelHidden, readOnly, disabled }:{ label:string; type?:string; placeholder?:string; register:any; error?:FieldErrorLike; className?: string; labelHidden?: boolean; readOnly?: boolean; disabled?: boolean; }){
  const message = (error as any)?.message as string | undefined;
  return (
    <div>
      {!labelHidden && <label className="label">{label}</label>}
      <input className={`input ${className ?? ""}`} type={type} placeholder={placeholder} {...register} readOnly={readOnly} disabled={disabled} />
      {message && <p className="error">{message}</p>}
    </div>
  );
}