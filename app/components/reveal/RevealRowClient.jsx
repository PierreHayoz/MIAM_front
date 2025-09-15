'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import clsx from 'clsx';
import useIsMobile from '@/app/lib/useIsMobile';

export default function RevealRowClient({
  id, // optionnel, utilisé seulement pour debug
  children,
  title,
  href,
  arrow = true,
  rowClassName,
  titleClassName,
  revealPadding = 'p-8',
  sideClasses = 'right-0',
  bg = 'bg-black',
  forceMobile = false,
  rowTextClassName = 'text-MIAMgreytext text-sm',
  revealTextClassName = 'text-white',
  inViewMargin = '-20% 0px -60% 0px', // on garde si tu veux des effets plus tard
  inViewAmount = 0.6,

  // ✅ nouveau: permet d’avoir plusieurs groupes indépendants
  groupKey = 'default',
}) {
  const isMobile = forceMobile || useIsMobile();
  const rowRef = useRef(null);
  useInView(rowRef, { margin: inViewMargin, amount: inViewAmount });

  const [isOpen, setIsOpen] = useState(false);

  // identifiant unique d’instance
  const selfKeyRef = useRef(
    (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now()
  );

  const eventName = `revealrow:open:${groupKey}`;

  // écoute les ouvertures des autres pour se fermer
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onAnyOpen = (e) => {
      const openedKey = e?.detail?.key;
      if (!openedKey || openedKey === selfKeyRef.current) return;
      // quelqu’un d’autre s’est ouvert → on se ferme
      setIsOpen(false);
    };
    window.addEventListener(eventName, onAnyOpen);
    return () => window.removeEventListener(eventName, onAnyOpen);
  }, [eventName]);

  const broadcastOpen = () => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(eventName, { detail: { key: selfKeyRef.current } }));
  };

  const open = () => {
    // broadcast d'abord pour fermer les autres, puis s’ouvrir
    broadcastOpen();
    setIsOpen(true);
  };
  const close = () => setIsOpen(false);
  const toggle = () => (isOpen ? close() : open());

  // Mobile: clic sur le titre → ouvre/ferme. 1er tap bloque la nav si href.
  const onMobileClick = (e) => {
    if (!isMobile) return;
    if (!href) {
      e.preventDefault();
    } else if (!isOpen) {
      e.preventDefault();
    }
    toggle();
  };

  // Desktop: hover/focus ouvre, mouseleave/blur ferme
  const desktopOpenProps = !isMobile
    ? {
        onMouseEnter: open,
        onFocus: open,
        onMouseLeave: close,
        onBlur: close,
      }
    : {};

  const TitleInner = typeof title === 'string' ? <span className="block">{title}</span> : title;

  const Title = href ? (
    <a
      href={href}
      className={clsx(
        titleClassName,
        'transition-transform',
        isOpen && 'translate-x-2'
      )}
      onClick={onMobileClick}
      {...desktopOpenProps}
    >
      {TitleInner}
    </a>
  ) : (
    <button
      type="button"
      className={clsx(
        'w-full text-left transition-transform',
        titleClassName,
        isOpen && 'translate-x-2'
      )}
      onClick={isMobile ? onMobileClick : open}
      {...desktopOpenProps}
    >
      {TitleInner}
    </button>
  );

  return (
    <div ref={rowRef} className={clsx(rowClassName, 'flex items-center')}>
      <div className={clsx('relative flex items-center gap-2 w-full pl-6', rowTextClassName)}>
        {arrow && (
          <span
            aria-hidden
            className={clsx(
              'absolute left-0 top-1/2 -translate-y-1/2 text-current',
              'transition-[opacity,transform] duration-300',
              isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
            )}
          >
            →
          </span>
        )}

        <div className="w-full">{Title}</div>
        
        <div
          className={clsx(
            'absolute top-12 w-fit transition-opacity duration-300 pointer-events-none',
            isOpen ? 'opacity-100 visible z-10' : 'opacity-0 invisible',
            revealPadding,
            sideClasses,
            bg,
            revealTextClassName
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
