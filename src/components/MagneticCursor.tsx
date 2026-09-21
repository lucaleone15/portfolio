import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

export function MagneticCursor() {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);

  // Smooth springs for fluid tracking
  const springX = useSpring(rawX, { stiffness: 450, damping: 32 });
  const springY = useSpring(rawY, { stiffness: 450, damping: 32 });

  useEffect(() => {
    // Detect mobile touch screens to disable custom cursor cleanly
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouchDevice(true);
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      rawX.set(e.clientX);
      rawY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest('a, button, [role="button"], input, textarea, [data-interactive="true"]');
      setIsHovered(!!interactive);
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [isVisible, rawX, rawY]);

  if (isTouchDevice || !isVisible) return null;

  const isDark = theme === 'dark';

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Precision center dot */}
      <motion.div
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isHovered ? 0 : 1,
          opacity: isHovered ? 0 : 1,
        }}
        transition={{ duration: 0.15 }}
        className={`w-1.5 h-1.5 rounded-full ${
          isDark 
            ? 'bg-[#CCFF00] shadow-[0_0_8px_#CCFF00]' 
            : 'bg-neutral-900 shadow-[0_0_8px_rgba(0,0,0,0.4)]'
        }`}
      />

      {/* Magnetic expanding circle with tactile hover feedback */}
      <motion.div
        style={{
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: isHovered ? 48 : 24,
          height: isHovered ? 48 : 24,
          borderColor: isHovered 
            ? (isDark ? '#CCFF00' : '#18181B') 
            : (isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.25)'),
          backgroundColor: isHovered 
            ? (isDark ? 'rgba(204, 255, 0, 0.12)' : 'rgba(0, 0, 0, 0.08)') 
            : 'rgba(0, 0, 0, 0)',
          opacity: isHovered ? 1 : 0.6,
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="rounded-full border backdrop-blur-[2px] pointer-events-none"
      />
    </div>
  );
}
