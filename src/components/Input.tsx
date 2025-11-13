import type { FieldError, FieldErrorsImpl, Merge } from "react-hook-form";
import { motion } from "framer-motion";
import { useState } from "react";

type FieldErrorLike = FieldError | Merge<FieldError, FieldErrorsImpl<any>>;

export default function Input({ label, type = "text", placeholder, register, error, className, labelHidden, readOnly, disabled, required }:{ label:string; type?:string; placeholder?:string; register:any; error?:FieldErrorLike; className?: string; labelHidden?: boolean; readOnly?: boolean; disabled?: boolean; required?: boolean; }){
  const message = (error as any)?.message as string | undefined;
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  
  const inputClasses = `input ${readOnly ? "bg-slate-50 text-slate-700" : ""} ${className ?? ""} transition-all duration-300`.trim();
  
  return (
    <motion.div
      animate={{
        y: isFocused ? -2 : 0,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {!labelHidden && (
        <label className="label">
          {label}
          {required && <span className="text-red-500 ml-0.5" aria-hidden>*</span>}
        </label>
      )}
      <div className="relative">
        <motion.input
          className={inputClasses}
          type={type}
          placeholder={placeholder}
          {...register}
          readOnly={readOnly}
          disabled={disabled}
          aria-required={required}
          aria-invalid={!!message || undefined}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            setHasValue(!!e.target.value);
          }}
          animate={{
            boxShadow: isFocused 
              ? "0 8px 24px rgba(26, 15, 80, 0.15)" 
              : "0 1px 3px rgba(0, 0, 0, 0.1)",
            borderColor: message 
              ? "#ef4444" 
              : isFocused 
                ? "#1A0F50" 
                : "#e2e8f0",
          }}
          transition={{ duration: 0.2 }}
        />
        {/* Checkmark de validación */}
        {!message && hasValue && !readOnly && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-xl"
          >
            ✓
          </motion.div>
        )}
      </div>
      {message && (
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="error"
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
}