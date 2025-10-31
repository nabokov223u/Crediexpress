import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FormProvider } from "./context/FormContext";
import Step1Identity from "./pages/Step1Identity";
import Step2Vehicle from "./pages/Step2Vehicle";
import Result from "./pages/Result";
import HeroLayout from "./layouts/HeroLayout";
import Step2HeroOverlay from "./pages/Step2HeroOverlay";

export type ResultStatus = "approved" | "review" | "denied" | null;

export default function App() {
  const [step, setStep] = useState(1);
  const [loadingIntro, setLoadingIntro] = useState(true);
  const [result, setResult] = useState<ResultStatus>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoadingIntro(false), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <FormProvider>
      {/* Splash */}
      <AnimatePresence>
        {loadingIntro && (
          <motion.div
            key="splash"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: '#1a0f50' }}
          >
            <motion.img
              src="/logo_icon.png"
              alt="Originarsa Icon"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-32 w-32 md:h-40 md:w-40"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!loadingIntro && (
        <HeroLayout
          imageSide={step === 2 ? "right" : "right"}
          imageSrc={step === 2 ? "/hero%202.jpg" : undefined}
          overlayTint={step === 2 ? "modern" : "brand"}
          photoChildren={step === 2 ? <Step2HeroOverlay /> : undefined}
          showCarousel={step !== 2}
        >
          <div className="relative">
            <header className="mb-6">
              <h1 className="text-3xl font-semibold tracking-tight text-origin">
                CrediExpress
              </h1>
              <p className="mt-1 text-modern">
                Precalificación rápida para tu crédito automotriz
              </p>
            </header>

            <div className="card p-6 overflow-hidden">
              <div className="min-h-[420px]">
                <AnimatePresence mode="wait">
                  {!result && step === 1 && (
                    <motion.div
                      key="s1"
                      initial={{ opacity: 0, x: -24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 24 }}
                      transition={{ duration: 0.35 }}
                    >
                      <Step1Identity onNext={() => setStep(2)} />
                    </motion.div>
                  )}
                  {!result && step === 2 && (
                    <motion.div
                      key="s2"
                      initial={{ opacity: 0, x: -24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 24 }}
                      transition={{ duration: 0.35 }}
                    >
                      <Step2Vehicle onBack={() => setStep(1)} onResult={(s) => setResult(s)} />
                    </motion.div>
                  )}
                  {result && (
                    <motion.div
                      key="res"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35 }}
                    >
                      <Result
                        status={result}
                        onRestart={() => {
                          setResult(null);
                          setStep(1);
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </HeroLayout>
      )}
    </FormProvider>
  );
}
