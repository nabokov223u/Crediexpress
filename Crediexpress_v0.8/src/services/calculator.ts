export function monthlyPayment(amount:number, months:number, monthlyRate=0.02){
  const i = monthlyRate; if(i===0) return amount/months;
  const factor = (i*Math.pow(1+i, months))/(Math.pow(1+i, months)-1);
  return amount*factor;
}