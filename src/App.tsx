import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FormProvider } from "./context/FormContext";
import Step1Identity from "./pages/Step1Identity";
import Step1IdentityMinimal from "./pages/Step1IdentityMinimal";
import Step2Vehicle from "./pages/Step2Vehicle";
import Step2VehicleMinimal from "./pages/Step2VehicleMinimal";
import Result from "./pages/Result";
import ResultMinimal from "./pages/ResultMinimal";
import HeroLayout from "./layouts/HeroLayout";
import MinimalLoginLayout from "./layouts/MinimalLoginLayout";
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
        <>
          {/* Step 1: Transición suave con fade */}
          <AnimatePresence mode="wait">
            {!result && step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              >
                <MinimalLoginLayout currentStep={1} totalSteps={3}>
                  <Step1IdentityMinimal onNext={() => setStep(2)} />
                </MinimalLoginLayout>
              </motion.div>
            )}

            {/* Step 2 con transición suave */}
            {!result && step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              >
                <MinimalLoginLayout currentStep={2} totalSteps={3}>
                  <Step2VehicleMinimal
                    onBack={() => setStep(1)}
                    onResult={(s) => setResult(s)}
                  />
                </MinimalLoginLayout>
              </motion.div>
            )}

            {/* Result con transición suave y elegante */}
            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -20 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              >
                <MinimalLoginLayout currentStep={3} totalSteps={3}>
                  <ResultMinimal
                    status={result}
                    onRestart={() => {
                      setResult(null);
                      setStep(1);
                    }}
                  />
                </MinimalLoginLayout>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </FormProvider>
  );
}
