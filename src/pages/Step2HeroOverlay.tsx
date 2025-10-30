import { monthlyPayment } from "../services/calculator";
import { useFormData } from "../context/FormContext";

export default function Step2HeroOverlay() {
  const { data } = useFormData();
  const amount = data.loan.vehicleAmount;
  const down = Math.round(amount * data.loan.downPaymentPct);
  const financed = amount - down;
  const cuota = monthlyPayment(financed, data.loan.termMonths);
  return (
    <div className="absolute top-20 right-6 md:right-8">
      <div className="bg-white/90 backdrop-blur-md border border-white/40 rounded-2xl shadow-xl w-[92vw] max-w-sm p-4 md:p-5">
        <div className="flex items-baseline justify-between">
          <h4 className="text-sm font-medium text-slate-700">Cuota estimada</h4>
          <span className="text-xs text-slate-500">referencial</span>
        </div>
        <p className="mt-1 text-3xl font-semibold text-origin">${cuota.toFixed(2)}</p>
        <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-slate-600">
          <div>
            <p className="text-slate-500">Vehículo</p>
            <p className="font-medium text-slate-700">${amount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-500">Entrada</p>
            <p className="font-medium text-slate-700">${down.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-500">A financiar</p>
            <p className="font-medium text-slate-700">${financed.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
