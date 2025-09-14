'use client';

import { useRef } from 'react';
import { useInView } from 'framer-motion';
import clsx from 'clsx';
import useIsMobile from '@/app/lib/useIsMobile';

export default function RevealRowClient({
  children,
  title,
  href,
  type,
  arrow = true,
  rowClassName,
  titleClassName,
  revealPadding = 'p-8',
  sideClasses = 'right-0',
  bg = 'bg-black',
  activateOnMobile = true,
  inViewMargin = '-20% 0px -60% 0px',
  inViewAmount = 0.6,
  forceMobile = false,

  // ✅ NEW: couleur de texte de la ligne (par défaut gris)
  rowTextClassName = 'text-MIAMgreytext text-sm group',

  // ✅ NEW: couleur de texte du popover (blanc ou noir selon bg)
  revealTextClassName = 'text-white',
}) {
  const isMobile = forceMobile || useIsMobile();
  const rowRef = useRef(null);
  const inView = useInView(rowRef, { margin: inViewMargin, amount: inViewAmount });
  const isActive = activateOnMobile && isMobile && inView;

  const Title = href ? (
    <a href={href} className={clsx(titleClassName, isActive && ' translate-x-8')}>{title}</a>
  ) : (
    <div className={clsx(titleClassName, isActive && ' translate-x-8')}>{title}</div>
  );

  return (
    <div ref={rowRef} className={`${rowClassName } group flex items-center`}>
      <div className={clsx('flex items-center gap-2 w-full ', rowTextClassName)}>
        {arrow && (
          <span
            className={clsx(
              'opacity-0 group-hover:opacity-100 absolute -left-8 group-hover:left-0 duration-500',
              isActive && 'opacity-100 left-0 scale-2'
            )}
          >→</span>
        )}
        <div className=" w-full"> {Title}</div>
       <div
        className={clsx(
          'absolute top-12 pointer-events-none w-fit z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ',
          revealPadding,
          sideClasses,
          bg,
          revealTextClassName,      // << couleur du contenu du popover
          isActive && 'opacity-100'
        )}
      >
        {children}
      </div>
      </div>

    </div>
  );
}
