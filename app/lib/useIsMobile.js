'use client';
import { useEffect, useState } from 'react';

export default function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1) signal navigateur (Chrome/Edge)
    const uaDataMobile = navigator.userAgentData?.mobile ?? false;

    // 2) fallback userAgent (autres navigateurs)
    const uaMobileRegex = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini|BlackBerry|webOS/i.test(
      navigator.userAgent
    );

    // 3) filet de sécurité par largeur (breakpoint)
    const mq = window.matchMedia(`(max-width:${breakpoint}px)`);

    const compute = () => setIsMobile(uaDataMobile || uaMobileRegex || mq.matches);

    compute();
    const onChange = () => compute();
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, [breakpoint]);

  return isMobile;
}
