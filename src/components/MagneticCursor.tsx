import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export function MagneticCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Very responsive, low-latency spring for instant, natural tracking
  const cursorX = useSpring(mouseX, { stiffness: 950, damping: 48, mass: 0.2 });
  const cursorY = useSpring(mouseY, { stiffness: 950, damping: 48, mass: 0.2 });

  const isVisibleRef = useRef(false);

  useEffect(() => {
    // Only disable if device ONLY has coarse pointer (pure touch phone/tablet)
    // Check if any fine pointer exists (mouse/trackpad)
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const isCoarseOnly = window.matchMedia('(pointer: coarse)').matches && !hasFinePointer;
    
    if (isCoarseOnly) {
      setIsTouchDevice(true);
      return;
    }

    document.documentElement.classList.add('custom-cursor-active');

    const onMouseMove = (e: MouseEvent) => {
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest('a, button, [role="button"], [data-interactive="true"]');
      setIsHovered(!!interactive);
    };

    const onMouseDown = () => setIsClicked(true);
    const onMouseUp = () => setIsClicked(false);
    const onMouseLeave = () => {
      isVisibleRef.current = false;
      setIsVisible(false);
    };
    const onMouseEnter = () => {
      isVisibleRef.current = true;
      setIsVisible(true);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [mouseX, mouseY]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <motion.div
      style={{
        x: cursorX,
        y: cursorY,
        translateX: '-50%',
        translateY: '-50%',
      }}
      animate={{
        scale: isClicked ? 0.75 : isHovered ? 2.8 : 1,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{
        scale: { type: 'spring', stiffness: 500, damping: 28 },
        opacity: { duration: 0.15 },
      }}
      className="pointer-events-none fixed top-0 left-0 z-[99999] w-3 h-3 rounded-full bg-white mix-blend-difference"
    />
  );
}
