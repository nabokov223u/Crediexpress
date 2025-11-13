import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface CountUpProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
}

export default function CountUp({ 
  value, 
  duration = 1, 
  prefix = "", 
  suffix = "",
  className = "",
  decimals = 0
}: CountUpProps) {
  const spring = useSpring(0, { 
    duration: duration * 1000,
    bounce: 0 
  });
  
  const display = useTransform(spring, (latest) => {
    const num = latest.toFixed(decimals);
    return prefix + Number(num).toLocaleString("es-EC") + suffix;
  });

  const [displayValue, setDisplayValue] = useState(prefix + "0" + suffix);

  useEffect(() => {
    spring.set(value);
    const unsubscribe = display.on("change", (latest) => {
      setDisplayValue(latest);
    });
    return unsubscribe;
  }, [value, spring, display]);

  return (
    <span className={className}>
      {displayValue}
    </span>
  );
}
