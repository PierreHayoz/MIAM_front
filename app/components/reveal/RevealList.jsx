// file: app/components/reveal/RevealList.jsx
import Image from 'next/image';
import clsx from 'clsx';
import RevealRowClient from './RevealRowClient'; // <-- îlot client

export const HOVER_BGS = ['bg-MIAMblack', 'bg-MIAMviolet', 'bg-MIAMtomato', 'bg-MIAMlime'];

// petit hash stable
export function hashKey(key) {
  const s = String(key ?? '');
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h >>> 0; // unsigned
}
export function pickBg(key, hoverBgs = HOVER_BGS) {
  const idx = hashKey(key) % hoverBgs.length;
  return hoverBgs[idx];
}

// util pour avatars
function initials(name = '?') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');
}

export default function RevealList({
  items = [],
  /** (item, idx) => string|number */ getKey,
  /** (item) => string */ getTitle,
  /** (item) => string|undefined */ getHref,
  /** "image" | "text" | "avatar" */ variant = 'image',
  /** (item) => string (url) — requis si variant=image ou avatar (avec photo) */ getThumbnail,
  /** (item) => string|ReactNode — utilisé si variant=text ou comme sous-titre */ getDescription,
  /** (item) => "image"|"text"|"avatar" — permet de mixer les variantes item par item */ getVariant,
  /** render prop prioritaire : (item, ctx) => ReactNode */ renderReveal,
  /** classes */
  containerClassName = '',
  rowClassName = 'border-b border-MIAMgreytext py-2 group relative',
  titleClassName = 'cursor-pointer group-hover:translate-x-8 duration-500',
  arrow = true,
  /** apparence du panneau révélé */
  revealSide = 'right', // 'right' | 'left'
  revealPadding = 'p-8',
  hoverBackgrounds = HOVER_BGS,
  imageSize = 300,
  // options mobile
  activateOnMobile = true,
  inViewMargin = '-35% 0px -35% 0px',
  inViewAmount = 0.3,
}) {
  const sideClasses = revealSide === 'left' ? 'left-0' : 'right-0';

  return (
    <div className={containerClassName}>
      {items.map((item, idx) => {
        const key = getKey ? getKey(item, idx) : idx;
        const bg = pickBg(key, hoverBackgrounds);
        const v = getVariant ? getVariant(item) : variant;
        const blendClass = bg === 'bg-MIAMblack' ? 'mix-blend-lighten invert' : 'mix-blend-darken';
        // ----- titre / href (strings) -----
        const title = typeof getTitle === 'function' ? getTitle(item) : String(item);
        const href = getHref ? getHref(item) : undefined;
        // ----- contenu révélé (ReactNode rendu côté serveur) -----
        const revealNode =
          renderReveal?.(item, { bg, blendClass, imageSize }) ??
          (v === 'text' ? (
            <div className="max-w-xs leading-tight text-white">
              {(() => {
                const desc = getDescription ? getDescription(item) : '';
                return typeof desc === 'string' ? <p className="whitespace-pre-line">{desc}</p> : desc;
              })()}
            </div>
          ) : v === 'avatar' ? (
            (() => {
              const url = getThumbnail ? getThumbnail(item) : undefined;
              const name = typeof getTitle === 'function' ? getTitle(item) : undefined;
              return url ? (
                <Image
                  width={imageSize}
                  height={imageSize}
                  src={url}
                  alt={name || 'avatar'}
                  className={clsx('rounded-full', blendClass)}
                />
              ) : (
                <div className="w-28 h-28 rounded-full flex items-center justify-center text-xl font-semibold text-white/90 border border-white/30">
                  {initials(String(name || '?'))}
                </div>
              );
            })()
          ) : (
            (() => {
              const url = getThumbnail ? getThumbnail(item) : undefined;
              const alt = typeof getTitle === 'function' ? getTitle(item) : 'image';
              if (!url) return null;
              return <Image width={imageSize} height={imageSize} src={url} alt={String(alt)} className={blendClass} />;
            })()
          ));

        return (
          <RevealRowClient
            key={key}
            title={title}
            href={href}
            arrow={arrow}
            rowClassName={rowClassName}
            titleClassName={titleClassName}
            revealPadding={revealPadding}
            sideClasses={sideClasses}
            bg={bg}
            activateOnMobile={activateOnMobile}
            inViewMargin={inViewMargin}
            inViewAmount={inViewAmount}
          >
            {revealNode}
          </RevealRowClient>
        );
      })}
    </div>
  );
}
