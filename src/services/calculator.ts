/**
 * Cálculo de cuota mensual usando sistema francés (anualidad)
 * Basado en la metodología del cotizador de crédito (TNA 30/360)
 * 
 * @param amount - Monto a financiar (principal)
 * @param months - Número de meses (plazo)
 * @param annualRate - TNA (Tasa Nominal Anual), por defecto 15.6% (0.156)
 * @returns Cuota mensual fija
 */
export function monthlyPayment(
  amount: number, 
  months: number, 
  annualRate: number = 0.156
): number {
  if (amount <= 0 || months <= 0) return 0;
  
  // Número de pagos por año (mensual)
  const m = 12;
  
  // Cálculo de tasa efectiva anual a partir de TNA
  // Formula: i_eff = (1 + TNA/m)^m - 1
  const effectiveAnnualRate = Math.pow(1 + annualRate / m, m) - 1;
  
  // Fracción de año para pagos mensuales (30/360)
  const yearFraction = 30 / 360; // 1/12
  
  // Tasa periódica (mensual)
  // Formula: i = (1 + i_eff)^(yearFraction) - 1
  const periodicRate = Math.pow(1 + effectiveAnnualRate, yearFraction) - 1;
  
  // Si la tasa es 0, retornar amortización lineal
  if (periodicRate === 0) return amount / months;
  
  // Fórmula de cuota constante (sistema francés)
  // C = P * [i * (1+i)^N] / [(1+i)^N - 1]
  const factor = Math.pow(1 + periodicRate, months);
  const payment = amount * (periodicRate * factor) / (factor - 1);
  
  return Math.round(payment * 100) / 100; // Redondear a 2 decimales
}