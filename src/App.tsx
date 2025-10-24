import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./index.css";

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app-container">
      {showSplash ? (
        <motion.div
          className="splash-screen"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          <img src="/Logo Negro Super.png" alt="Originarsa" className="logo" />
        </motion.div>
      ) : (
        <motion.div
          className="hero-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="hero-content">
            <h1>Bienvenido a CrediExpress</h1>
            <p>Precalificación rápida para tu crédito automotriz</p>
            <button className="btn-primary">Calificar para crédito</button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default App;
