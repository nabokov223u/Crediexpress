import type { FieldError, FieldErrorsImpl, Merge } from "react-hook-form";

type FieldErrorLike = FieldError | Merge<FieldError, FieldErrorsImpl<any>>;

export default function Input({ label, type = "text", placeholder, register, error, className, labelHidden, readOnly, disabled, required }:{ label:string; type?:string; placeholder?:string; register:any; error?:FieldErrorLike; className?: string; labelHidden?: boolean; readOnly?: boolean; disabled?: boolean; required?: boolean; }){
  const message = (error as any)?.message as string | undefined;
  const inputClasses = `input ${readOnly ? "bg-slate-50 text-slate-700" : ""} ${className ?? ""}`.trim();
  return (
    <div>
      {!labelHidden && (
        <label className="label">
          {label}
          {required && <span className="text-red-500 ml-0.5" aria-hidden>*</span>}
        </label>
      )}
      <input
        className={inputClasses}
        type={type}
        placeholder={placeholder}
        {...register}
        readOnly={readOnly}
        disabled={disabled}
        aria-required={required}
        aria-invalid={!!message || undefined}
      />
      {message && <p className="error">{message}</p>}
    </div>
  );
}