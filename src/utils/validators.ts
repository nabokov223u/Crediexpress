import { z } from "zod";
export const identitySchema = z.object({
  idNumber: z.string().min(8, "Cédula inválida"),
  fullName: z.string().min(3, "Nombre requerido"),
  phone: z.string().min(7, "Teléfono inválido").regex(/^\+?\d{7,15}$/,{ message:"Teléfono inválido" }),
  email: z.string().email("Correo inválido"),
  maritalStatus: z.enum(["single","married"]),
  spouseId: z.string().optional(),
}).refine((d)=> d.maritalStatus !== "married" || (!!d.spouseId && d.spouseId.length>=8), { message:"Ingresa la cédula del cónyuge", path:["spouseId"]});
export const vehicleSchema = z.object({ vehicleAmount: z.number().min(8000).max(60000), downPaymentPct: z.number().min(0.2).max(0.5), termMonths: z.number().min(12).max(72) });
