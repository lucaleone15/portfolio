import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface IntroCurtainProps {
  onDone?: () => void;
}

export function IntroCurtain({ onDone }: IntroCurtainProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      if (onDone) onDone();
    }, 1100);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          exit={{ y: '-100%' }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-50 flex flex-col justify-between p-8 sm:p-14 bg-[#0A0A0C] border-b border-white/10 text-white"
          aria-hidden="true"
        >
          <div className="flex justify-between items-center text-xs text-[#71717A] tracking-wider uppercase font-semibold">
            <span>Portfolio</span>
            <span>2026</span>
          </div>

          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="text-6xl sm:text-8xl md:text-9xl text-white font-black tracking-tight inline-block">
                Luca Leone<span className="text-[#CCFF00]">.</span>
              </h1>
            </motion.div>
          </div>

          <div className="flex justify-between items-center text-xs text-[#52525B]">
            <span>Ingénierie des médias</span>
            <span>HEIG-VD</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
