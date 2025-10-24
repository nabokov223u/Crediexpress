import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FormProvider } from "./context/FormContext";
import Step1Identity from "./pages/Step1Identity";
import Step2Vehicle from "./pages/Step2Vehicle";
import Step3Review from "./pages/Step3Review";
import Result from "./pages/Result";
import Stepper from "./components/Stepper";

export type ResultStatus = "approved" | "review" | "denied" | null;

export default function App() {
  const [step, setStep] = useState(1);
  const [loadingIntro, setLoadingIntro] = useState(true);
  const [result, setResult] = useState<ResultStatus>(null);

  useEffect(() => {
    const t = setTimeout(()=>setLoadingIntro(false), 2500); // mostrar SIEMPRE el splash en cada carga
    return ()=>clearTimeout(t);
  }, []);

  return (
    <FormProvider>
      {/* Splash */}
      <AnimatePresence>
        {loadingIntro && (
          <motion.div key="splash" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.6}}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Originarsa" className="h-10" />
              <span className="text-origin font-semibold text-lg">Originarsa</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!loadingIntro && (
        <div className="container-sm py-10 relative">
          {/* Brand top-left */}
          <img src="/logo.png" alt="Originarsa" className="h-8 absolute top-6 left-6" />

          <header className="mb-8 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-origin">CrediExpress</h1>
            <p className="text-slate-600 mt-2">Precalificación rápida para tu crédito automotriz</p>
          </header>

          <div className="card p-6 overflow-hidden">
            <Stepper current={result ? 3 : step} total={3} />
            <div className="min-h-[420px]">
              <AnimatePresence mode="wait">
                {!result && step === 1 && (
                  <motion.div key="s1" initial={{opacity:0,x:-24}} animate={{opacity:1,x:0}} exit={{opacity:0,x:24}} transition={{duration:.35}}>
                    <Step1Identity onNext={()=>setStep(2)} />
                  </motion.div>
                )}
                {!result && step === 2 && (
                  <motion.div key="s2" initial={{opacity:0,x:-24}} animate={{opacity:1,x:0}} exit={{opacity:0,x:24}} transition={{duration:.35}}>
                    <Step2Vehicle onBack={()=>setStep(1)} onNext={()=>setStep(3)} />
                  </motion.div>
                )}
                {!result && step === 3 && (
                  <motion.div key="s3" initial={{opacity:0,x:-24}} animate={{opacity:1,x:0}} exit={{opacity:0,x:24}} transition={{duration:.35}}>
                    <Step3Review onBack={()=>setStep(2)} onResult={(s)=>setResult(s)} />
                  </motion.div>
                )}
                {result && (
                  <motion.div key="res" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.35}}>
                    <Result status={result} onRestart={()=>{ setResult(null); setStep(1); }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </FormProvider>
  );
}
