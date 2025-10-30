import { createContext, useContext, useState } from "react";

export type Applicant = { idNumber: string; fullName: string; phone: string; email: string; maritalStatus: "single"|"married"; spouseId?: string; };
export type Loan = { vehicleAmount: number; downPaymentPct: number; termMonths: number; };
export type FormData = { applicant: Applicant; loan: Loan; };

const defaultData: FormData = {
  applicant: { idNumber: "", fullName: "", phone: "", email: "", maritalStatus: "single", spouseId: "" },
  loan: { vehicleAmount: 15000, downPaymentPct: 0.2, termMonths: 48 }
};

const FormCtx = createContext<{ data: FormData; setData: (d: FormData)=>void }|null>(null);

export function FormProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<FormData>(() => {
    const saved = sessionStorage.getItem("crediexpress:data");
    if (!saved) return defaultData;
    try {
      const raw = JSON.parse(saved);
      const migrated: FormData = {
        applicant: {
          idNumber: raw?.applicant?.idNumber ?? "",
          fullName: raw?.applicant?.fullName ?? "",
          phone: raw?.applicant?.phone ?? "",
          email: raw?.applicant?.email ?? "",
          maritalStatus: raw?.applicant?.maritalStatus ?? "single",
          spouseId: raw?.applicant?.spouseId ?? "",
        },
        loan: {
          vehicleAmount: raw?.loan?.vehicleAmount ?? defaultData.loan.vehicleAmount,
          downPaymentPct: raw?.loan?.downPaymentPct ?? defaultData.loan.downPaymentPct,
          termMonths: raw?.loan?.termMonths ?? defaultData.loan.termMonths,
        },
      };
      return migrated;
    } catch {
      return defaultData;
    }
  });
  const setAndPersist = (d: FormData) => { sessionStorage.setItem("crediexpress:data", JSON.stringify(d)); setData(d); };
  return <FormCtx.Provider value={{ data, setData: setAndPersist }}>{children}</FormCtx.Provider>;
}

export const useFormData = () => { const ctx = useContext(FormCtx); if(!ctx) throw new Error("useFormData must be used within FormProvider"); return ctx; };
