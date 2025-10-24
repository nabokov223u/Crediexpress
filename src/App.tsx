import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FormProvider } from "./context/FormContext";
import Step1Identity from "./pages/Step1Identity";
import Step2Vehicle from "./pages/Step2Vehicle";
import Step3Review from "./pages/Step3Review";
import Result from "./pages/Result";

export type ResultStatus = "approved" | "review" | "denied" | null;

export default function App() {
  const [step, setStep] = useState(1);
  const [loadingIntro, setLoadingIntro] = useState(true);
  const [result, setResult] = useState<ResultStatus>(null);

  useEffect(() => { const t = setTimeout(()=>setLoadingIntro(false), 600); return ()=>clearTimeout(t); }, []);

  return (
    <FormProvider>
      <AnimatePresence>
        {loadingIntro && (
          <motion.div key="splash" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.4}}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Originarsa" className="h-8" />
              <span className="text-origin font-semibold">Originarsa</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container-sm py-10 relative">
        <img src="/logo.png" alt="Originarsa" className="h-8 absolute top-6 left-6" />
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-origin">CrediExpress</h1>
          <p className="text-slate-600 mt-2">Precalificación rápida para tu crédito automotriz</p>
        </header>

        <div className="card p-6 overflow-hidden">
          <div className="w-full h-2 bg-trust rounded-full overflow-hidden mb-6">
            <motion.div initial={{ width: 0 }} animate={{ width: (result?100: (step/3*100)) + "%" }}
              transition={{ duration: .4, ease: "easeInOut" }} className="h-full bg-modern" />
          </div>

          <div className="min-h-[420px]">
            <AnimatePresence mode="wait">
              {!result && step === 1 && (
                <motion.div key="step1" initial={{opacity:0,x:-24}} animate={{opacity:1,x:0}} exit={{opacity:0,x:24}} transition={{duration:.35}}>
                  <Step1Identity onNext={() => setStep(2)} />
                </motion.div>
              )}

              {!result && step === 2 && (
                <motion.div key="step2" initial={{opacity:0,x:-24}} animate={{opacity:1,x:0}} exit={{opacity:0,x:24}} transition={{duration:.35}}>
                  <Step2Vehicle onBack={() => setStep(1)} onNext={() => setStep(3)} />
                </motion.div>
              )}

              {!result && step === 3 && (
                <motion.div key="step3" initial={{opacity:0,x:-24}} animate={{opacity:1,x:0}} exit={{opacity:0,x:24}} transition={{duration:.35}}>
                  <Step3Review onBack={() => setStep(2)} onResult={(s)=>setResult(s)} />
                </motion.div>
              )}

              {result && (
                <motion.div key="result" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.35}}>
                  <Result status={result} onRestart={() => { setResult(null); setStep(1); }} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
