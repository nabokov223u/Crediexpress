import { FieldError } from "react-hook-form";
export default function Input({ label, type="text", placeholder, register, error }:{ label:string; type?:string; placeholder?:string; register:any; error?:FieldError; }){
  return (<div><label className="label">{label}</label><input className="input" type={type} placeholder={placeholder} {...register} />{error && <p className="error">{error.message as string}</p>}</div>);
}