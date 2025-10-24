import { createContext, useContext, useState } from "react";

export type Applicant = { idNumber: string; fullName: string; maritalStatus: "single"|"married"; spouseId?: string; };
export type Loan = { vehicleAmount: number; downPaymentPct: number; termMonths: number; };
export type FormData = { applicant: Applicant; loan: Loan; };

const defaultData: FormData = {
  applicant: { idNumber: "", fullName: "", maritalStatus: "single", spouseId: "" },
  loan: { vehicleAmount: 15000, downPaymentPct: 0.2, termMonths: 48 }
};

const FormCtx = createContext<{ data: FormData; setData: (d: FormData)=>void }|null>(null);

export function FormProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<FormData>(() => {
    const saved = sessionStorage.getItem("crediexpress:data");
    return saved ? JSON.parse(saved) : defaultData;
  });
  const setAndPersist = (d: FormData) => { sessionStorage.setItem("crediexpress:data", JSON.stringify(d)); setData(d); };
  return <FormCtx.Provider value={{ data, setData: setAndPersist }}>{children}</FormCtx.Provider>;
}

export const useFormData = () => { const ctx = useContext(FormCtx); if(!ctx) throw new Error("useFormData must be used within FormProvider"); return ctx; };
