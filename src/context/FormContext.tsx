import { createContext, useContext, useState } from "react";

export type Applicant = { idNumber: string; fullName: string; nombres: string; phone: string; email: string; maritalStatus: "single"|"married"; spouseId?: string; };
export type Loan = { vehicleAmount: number; downPaymentPct: number; termMonths: number; };
export type FormData = { applicant: Applicant; loan: Loan; };

export const defaultData: FormData = {
  applicant: { idNumber: "", fullName: "", nombres: "", phone: "", email: "", maritalStatus: "single", spouseId: "" },
  loan: { vehicleAmount: 15000, downPaymentPct: 0.2, termMonths: 48 }
};

const FormCtx = createContext<{ data: FormData; setData: (d: FormData)=>void; resetData: () => void }|null>(null);

export function FormProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<FormData>(defaultData);
  const resetData = () => setData(defaultData);

  return (
    <FormCtx.Provider value={{ data, setData, resetData }}>
      {children}
    </FormCtx.Provider>
  );
}

export const useFormData = () => {
  const ctx = useContext(FormCtx);
  if(!ctx) throw new Error("useFormData must be used within FormProvider");
  return ctx;
};
