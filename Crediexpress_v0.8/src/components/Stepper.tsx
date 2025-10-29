import { motion } from "framer-motion";
export default function Stepper({ current, total }: { current:number; total:number; }){
  const pct = Math.min(100, Math.max(0, (current/total)*100));
  return (<div className="mb-6">
    <div className="w-full h-2 bg-trust rounded-full overflow-hidden">
      <motion.div initial={{width:0}} animate={{width: pct + "%"}} transition={{duration:.4,ease:"easeInOut"}} className="h-full bg-modern"/>
    </div>
    <p className="text-xs text-slate-500 mt-2">Paso {current} de {total}</p>
  </div>);
}