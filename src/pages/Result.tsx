export default function Result({ status, onRestart }:{ status:"approved"|"review"|"denied"; onRestart:()=>void; }){
  const map: Record<string,{title:string;desc:string;tone:string;icon:string}> = {
    approved:{ title:"¡Preaprobado!", desc:"Tu crédito fue preaprobado. Te contactaremos en minutos.", tone:"bg-green-50 text-green-800 border-green-200", icon:"✅" },
    review:{ title:"En análisis", desc:"Estamos revisando tu solicitud. Te contactaremos pronto.", tone:"bg-blue-50 text-blue-800 border-blue-200", icon:"🕓" },
    denied:{ title:"No aprobado", desc:"Por ahora no cumples con los requisitos. Puedes reintentar más adelante.", tone:"bg-red-50 text-red-800 border-red-200", icon:"❌" },
  };
  const cfg = map[status];
  return (<div className="container-sm py-12 text-center">
    <div className={`mx-auto max-w-md p-8 rounded-2xl border ${cfg.tone}`}>
      <div className="text-5xl mb-3">{cfg.icon}</div>
      <h2 className="text-2xl font-semibold mb-2">{cfg.title}</h2>
      <p className="text-sm opacity-80">{cfg.desc}</p>
      <button className="btn-ghost mt-6" onClick={onRestart}>Volver al inicio</button>
    </div>
  </div>);
}