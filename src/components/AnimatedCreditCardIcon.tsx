import { motion } from 'framer-motion';

interface AnimatedCreditCardIconProps {
  className?: string;
}

export default function AnimatedCreditCardIcon({ className = "w-8 h-8" }: AnimatedCreditCardIconProps) {
  return (
    <motion.svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 150, damping: 12 }}
    >
      <motion.rect
        x="2"
        y="5"
        width="20"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      <motion.line
        x1="2"
        y1="10"
        x2="22"
        y2="10"
        stroke="currentColor"
        strokeWidth="2"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
      />
      <motion.rect
        x="5"
        y="14"
        width="6"
        height="2"
        rx="1"
        fill="currentColor"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.7 }}
      />
    </motion.svg>
  );
}
