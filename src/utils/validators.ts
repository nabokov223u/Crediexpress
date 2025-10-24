import { z } from "zod";
export const identitySchema = z.object({
  idNumber: z.string().min(8, "Cédula inválida"),
  fullName: z.string().min(3, "Nombre requerido"),
  maritalStatus: z.enum(["single","married"]),
  spouseId: z.string().optional(),
}).refine((d)=> d.maritalStatus !== "married" || (!!d.spouseId && d.spouseId.length>=8), { message:"Ingresa la cédula del cónyuge", path:["spouseId"]});
export const vehicleSchema = z.object({ vehicleAmount: z.number().min(8000).max(60000), downPaymentPct: z.number().min(0.2).max(0.5), termMonths: z.number().min(12).max(72) });
