// src/utils/validations.ts
export const isValidCedula = (cedula: string): boolean => /^\d{10}$/.test(cedula);
