'use client';
import { useEffect, useState } from 'react';

function useIsTouchish({ includeSmallScreen = true } = {}) {
  const [isTouchish, setIsTouchish] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mqCoarse = window.matchMedia('(pointer: coarse)');
    const mqNoHover = window.matchMedia('(hover: none)');
    const mqSmall  = window.matchMedia('(max-width: 768px)');

    const compute = () =>
      mqCoarse.matches ||
      mqNoHover.matches ||
      navigator.maxTouchPoints > 0 ||
      (includeSmallScreen && mqSmall.matches);

    const update = () => setIsTouchish(compute());

    [mqCoarse, mqNoHover, mqSmall].forEach(mq => mq.addEventListener?.('change', update));
    update();
    return () => [mqCoarse, mqNoHover, mqSmall].forEach(mq => mq.removeEventListener?.('change', update));
  }, []);

  return isTouchish;
}
export default useIsTouchish;
