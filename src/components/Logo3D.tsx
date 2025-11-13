import { motion } from "framer-motion";
import { useState } from "react";

export default function Logo3D() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      animate={{
        rotateY: isHovered ? 360 : 0,
        scale: isHovered ? 1.1 : 1,
      }}
      transition={{
        duration: isHovered ? 0.8 : 3,
        repeat: isHovered ? 0 : Infinity,
        ease: isHovered ? "easeInOut" : "linear",
      }}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-brand/20 blur-3xl"
        animate={{
          scale: isHovered ? [1, 1.3, 1] : [1, 1.1, 1],
          opacity: isHovered ? [0.3, 0.6, 0.3] : [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Logo principal */}
      <motion.img
        src="/logo_3d.png"
        alt="Originarsa"
        className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
        animate={{
          y: isHovered ? 0 : [-8, 8, -8],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Partículas flotantes */}
      {isHovered && (
        <>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-brand/40 rounded-full"
              initial={{
                x: 0,
                y: 0,
                opacity: 0,
              }}
              animate={{
                x: [0, (Math.random() - 0.5) * 120],
                y: [0, -Math.random() * 120],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.1,
                ease: "easeOut",
              }}
              style={{
                left: "50%",
                top: "50%",
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
}
