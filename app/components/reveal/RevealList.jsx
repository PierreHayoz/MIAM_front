// app/components/reveal/RevealList.jsx
import Image from 'next/image';
import clsx from 'clsx';
import RevealRowClient from './RevealRowClient';

export const HOVER_BGS = ['bg-MIAMblack', 'bg-MIAMviolet', 'bg-MIAMtomato', 'bg-MIAMlime'];

export function hashKey(key) {
  const s = String(key ?? '');
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h >>> 0;
}
export function pickBg(key, hoverBgs = HOVER_BGS) {
  const idx = hashKey(key) % hoverBgs.length;
  return hoverBgs[idx];
}

// 🎨 Helpers couleurs
const textOnBg = (bg) => (bg === 'bg-MIAMlime' ? 'text-MIAMblack' : 'text-white');
const borderOnBg = (bg) => (bg === 'bg-MIAMlime' ? 'border-black/30' : 'border-white/30');

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
  getKey,
  getTitle,
  getHref,
  getThumbnail,
  renderReveal,
  containerClassName = '',
  rowClassName = 'border-b border-MIAMgreytext py-2 group relative',
  titleClassName = 'cursor-pointer group-hover:translate-x-8 duration-500',
  arrow = true,
  revealSide = 'right',
  revealPadding = 'p-8',
  hoverBackgrounds = HOVER_BGS,
  imageSize = 300,
  activateOnMobile = true,
  inViewMargin = '-35% 0px -35% 0px',
  inViewAmount = 0.3,
  // debug optionnel :
  unoptimizedImages = false,
  imageClassName = '',
}) {
  const sideClasses = revealSide === 'left' ? 'left-0' : 'right-0';

  return (
    <div className={`${containerClassName}`} >
      {items.map((item, idx) => {
        const key = getKey ? getKey(item, idx) : idx;
        const bg = pickBg(key, hoverBackgrounds);

        const blendClass = bg === 'bg-MIAMblack' ? 'mix-blend-lighten invert' : 'mix-blend-darken';
        const fgClass = textOnBg(bg);   // ✅ text color
        const bdClass = borderOnBg(bg);

        const title = typeof getTitle === 'function' ? getTitle(item) : String(item);
        const href = getHref ? getHref(item) : undefined;

        const revealNode =
          renderReveal?.(item, { bg, blendClass, imageSize, fgClass, bdClass }) ??
          (() => {
            const url = getThumbnail ? getThumbnail(item) : undefined;
            const alt = title || 'image';
            if (url) {
              return (
                <Image
                  width={imageSize}
                  height={imageSize}
                  src={url}
                  alt={String(alt)}
                  className={clsx('rounded-full', blendClass, imageClassName)}
                  unoptimized={unoptimizedImages}
                  onError={() => console.warn('Image failed:', url)}
                />
              );
            }
            // Fallback initiales
            return (
              <div
                className={clsx(
                  'w-28 h-28 rounded-full flex items-center justify-center text-xl font-semibold ',
                  fgClass, // ✅ applique couleur texte
                  bdClass,
                  'border'
                )}
              >
                {initials(String(title || '?'))}
              </div>
            );
          })();

        // ...
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

            rowTextClassName="text-MIAMgreytext text-sm"
            revealTextClassName={fgClass}

            activateOnMobile={activateOnMobile}
            inViewMargin={inViewMargin}
            inViewAmount={inViewAmount}
          >
            {revealNode}
          </RevealRowClient>
        );
        // ...

      })}
    </div>
  );
}
