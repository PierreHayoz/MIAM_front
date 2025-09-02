'use client';

import { useRef } from 'react';
import { useInView } from 'framer-motion';
import clsx from 'clsx';
import useIsMobile from '@/app/lib/useIsMobile'; // <- importe le hook

export default function RevealRowClient({
  children,
  title,
  href,
  arrow = true,
  rowClassName,
  titleClassName,
  revealPadding = 'p-8',
  sideClasses = 'right-0',
  bg = 'bg-black',
  activateOnMobile = true,
  inViewMargin = '-35% 0px -35% 0px',
  inViewAmount = 0.3,
  forceMobile = false, // optionnel pour debug
}) {
  const isMobile = forceMobile || useIsMobile();        // <-- juste “mobile ou pas”
  const rowRef = useRef(null);
  const inView = useInView(rowRef, { margin: inViewMargin, amount: inViewAmount });
  const isActive = activateOnMobile && isMobile && inView;

  const Title = href ? (
    <a href={href} className={clsx(titleClassName, isActive && 'translate-x-8')}>{title}</a>
  ) : (
    <div className={clsx(titleClassName, isActive && 'translate-x-8')}>{title}</div>
  );

  return (
    <div ref={rowRef} className={`${rowClassName}  ${isMobile && 'py-6'}`} >
      <div className="flex items-center gap-2 w-full text-MIAMgreytext text-sm">
        {arrow && (
          <span className={clsx(
            'opacity-0 group-hover:opacity-100 absolute -left-8 group-hover:left-0 duration-500',
            isActive && 'opacity-100 left-0 scale-2'
          )}>→</span>
        )}
        {Title}
      </div>

      <div
        className={clsx(
          'absolute top-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          revealPadding,
          sideClasses,
          bg,
          isActive && 'opacity-100'
        )}
      >
        {children}
      </div>
    </div>
  );
}
