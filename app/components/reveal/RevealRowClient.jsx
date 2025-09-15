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
  rowTextClassName = 'text-MIAMgreytext text-sm group',
  revealTextClassName = 'text-white',
}) {
  const isMobile = forceMobile || useIsMobile();
  const rowRef = useRef(null);
  const inView = useInView(rowRef, { margin: inViewMargin, amount: inViewAmount });
  const isActive = activateOnMobile && isMobile && inView;

  const Title = href ? (
    <a href={href} className={clsx(titleClassName, isActive && 'translate-x-2')}>
      {title}
    </a>
  ) : (
    <div className={clsx(titleClassName, isActive && 'translate-x-2')}>{title}</div>
  );

  return (
    <div ref={rowRef} className={clsx(rowClassName, 'group flex items-center')}>
      {/* 👇 relative + padding pour l’icône */}
      <div className={clsx('relative flex items-center gap-2 w-full pl-6', rowTextClassName)}>
        {arrow && (
          <span
            aria-hidden
            className={clsx(
              // position fixe, jamais hors cadre
              'absolute left-0 top-1/2 -translate-y-1/2 text-current',
              // états par défaut
              'opacity-0 -translate-x-2 transition-[opacity,transform] duration-300',
              // au hover (desktop)
              'group-hover:opacity-100 group-hover:translate-x-0',
              // au scroll (mobile)
              isActive && 'opacity-100 translate-x-0'
            )}
          >
            →
          </span>
        )}
        <div className="w-full">{Title}</div>
        <div
          className={clsx(
            'absolute top-12 pointer-events-none w-fit z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
            revealPadding,
            sideClasses,
            bg,
            revealTextClassName,
            isActive && 'opacity-100'
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
