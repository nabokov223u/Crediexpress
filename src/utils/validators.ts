import { z } from "zod";

// Validador de cédula ecuatoriana
function validarCedulaEcuatoriana(cedula: string): boolean {
  if (!/^\d{10}$/.test(cedula)) return false;
  
  const provincia = parseInt(cedula.substring(0, 2), 10);
  if (provincia < 1 || provincia > 24) return false;
  
  const tercerDigito = parseInt(cedula[2], 10);
  if (tercerDigito > 5) return false;
  
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  const digitoVerificador = parseInt(cedula[9], 10);
  
  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedula[i], 10) * coeficientes[i];
    if (valor >= 10) valor -= 9;
    suma += valor;
  }
  
  const resultado = suma % 10 === 0 ? 0 : 10 - (suma % 10);
  return resultado === digitoVerificador;
}

export const identitySchema = z.object({
  idNumber: z.string()
    .length(10, "La cédula debe tener 10 dígitos")
    .regex(/^\d{10}$/, "Solo se permiten números")
    .refine(validarCedulaEcuatoriana, "Cédula ecuatoriana inválida"),
  fullName: z.string().min(3, "Nombre requerido"),
  phone: z.string().min(7, "Teléfono inválido").regex(/^\+?\d{7,15}$/,{ message:"Teléfono inválido" }),
  email: z.string().email("Correo inválido"),
  maritalStatus: z.enum(["single","married"]),
  spouseId: z.string().optional(),
}).refine((d)=> d.maritalStatus !== "married" || (!!d.spouseId && d.spouseId.length>=8), { message:"Ingresa la cédula del cónyuge", path:["spouseId"]});
export const vehicleSchema = z.object({ vehicleAmount: z.number().min(8000).max(60000), downPaymentPct: z.number().min(0.2).max(0.5), termMonths: z.number().min(12).max(72) });
