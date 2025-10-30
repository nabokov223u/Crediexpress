import { monthlyPayment } from "../services/calculator";
import { useFormData } from "../context/FormContext";

export default function Step2HeroOverlay() {
  const { data } = useFormData();
  const amount = data.loan.vehicleAmount;
  const down = Math.round(amount * data.loan.downPaymentPct);
  const financed = amount - down;
  const cuota = monthlyPayment(financed, data.loan.termMonths);
  return (
    <div className="absolute inset-0 flex items-center justify-center px-6">
      <div className="bg-white/90 backdrop-blur-md border border-white/40 rounded-2xl shadow-xl w-[92vw] max-w-xl p-6 md:p-7" aria-label="Cuota mensual (estimado)">
        <div className="flex items-baseline justify-between mb-2">
          <h4 className="text-sm font-medium text-slate-700">Cuota mensual <span className="text-slate-500 font-normal">(estimado)</span></h4>
        </div>
        <p className="text-4xl md:text-5xl font-semibold text-origin text-center tracking-tight">${cuota.toFixed(2)}</p>
        <div className="mt-4 grid grid-cols-3 gap-3 text-[11px] md:text-xs text-slate-600 text-center">
          <div>
            <p className="uppercase tracking-wide text-slate-500">Vehículo</p>
            <p className="font-medium text-slate-700">${amount.toLocaleString()}</p>
          </div>
          <div>
            <p className="uppercase tracking-wide text-slate-500">Entrada</p>
            <p className="font-medium text-slate-700">${down.toLocaleString()}</p>
          </div>
          <div>
            <p className="uppercase tracking-wide text-slate-500">A financiar</p>
            <p className="font-medium text-slate-700">${financed.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
