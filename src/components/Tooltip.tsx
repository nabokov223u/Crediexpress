import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useState } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ children, content, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onTouchStart={() => setIsVisible(true)}
      onTouchEnd={() => setTimeout(() => setIsVisible(false), 2000)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: position === 'top' ? 10 : position === 'bottom' ? -10 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={`absolute ${positionClasses[position]} z-50 pointer-events-none`}
          >
            <div className="bg-slate-800/95 backdrop-blur-sm text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl border border-white/10 whitespace-nowrap">
              {content}
              {/* Flecha indicadora */}
              <div 
                className={`absolute w-2 h-2 bg-slate-800/95 border-white/10 transform rotate-45 ${
                  position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2 border-r border-b' :
                  position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2 border-l border-t' :
                  position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2 border-r border-t' :
                  'left-[-4px] top-1/2 -translate-y-1/2 border-l border-b'
                }`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
