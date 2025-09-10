"use client";

import { useRef } from "react";
import Image from "next/image";
import clsx from "clsx";
import RevealRowClient from "@/app/components/reveal/RevealRowClient";

const HOVER_BGS = ["bg-MIAMblack", "bg-MIAMviolet", "bg-MIAMtomato", "bg-MIAMlime"];
const textOnBg = (bg) => (bg === "bg-MIAMlime" ? "text-MIAMblack" : "text-white");
const borderOnBg = (bg) => (bg === "bg-MIAMlime" ? "border-black/30" : "border-white/30");

function randUint() {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const a = new Uint32Array(1);
    crypto.getRandomValues(a);
    return a[0] >>> 0;
  }
  return (Math.random() * 0xffffffff) >>> 0;
}

function xorshift32(s) {
  let x = s | 0;
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
  return x >>> 0;
}
const pickR = (arr, r) => arr[r % arr.length];

function initials(name = "?") {
  return String(name).split(/\s+/).filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase()).join("");
}

export default function ArchivesListClient({
  groups = [],
  containerClassName = "",
  rowClassName = "border-b border-MIAMgreytext py-2 group relative",
  titleClassName = "cursor-pointer group-hover:translate-x-8 duration-500",
  revealSide = "right",
  revealPadding = "p-8",
  arrow = true,
  imageSize = 300,
  imageClassName = "",
  unoptimizedImages = false,
  activateOnMobile = true,
  inViewMargin = "-35% 0px -35% 0px",
  inViewAmount = 0.3,
}) {
  const sideClasses = revealSide === "left" ? "left-0" : "right-0";

  // 🔀 RNG par composant (ré-initialisé à chaque montage/navigation),
  // + caches par item pour rester stable pendant la vie du composant.
  const seedRef = useRef(randUint());
  const bgCacheRef = useRef(new Map());         // key -> bg class
  const blendCacheRef = useRef(new Map());      // key -> blend classes

  // helper: tirer un bg "au hasard" (avec petit "reroll" anti-noir si tu veux)
  const pickRandomBg = (key) => {
    const cache = bgCacheRef.current;
    if (cache.has(key)) return cache.get(key);

    seedRef.current = xorshift32(seedRef.current);
    let bg = pickR(HOVER_BGS, seedRef.current);

    // option: si tu veux limiter la fréquence du noir, reroll 1x sur noir ~50% du temps
    if (bg === "bg-MIAMblack" && (seedRef.current & 1)) {
      seedRef.current = xorshift32(seedRef.current);
      bg = pickR(HOVER_BGS, seedRef.current);
    }

    cache.set(key, bg);
    return bg;
  };

  const blendFor = (bg) => (bg === "bg-MIAMblack" ? "mix-blend-lighten invert" : "mix-blend-darken");

  return (
    <div className={containerClassName}>
      {groups.map(({ year, items }) => (
        <div key={year} className="space-y-2 mb-10">
          <h3 className="text-xl mb-2 opacity-70">{year}</h3>

          {items.map((it, idx) => {
            const key = it.key ?? idx;

            // 🎲 vrai aléatoire par item (figé tant que le composant vit)
            const bg = pickRandomBg(key);
            const blendClass = blendCacheRef.current.get(key) || (() => {
              const b = blendFor(bg);
              blendCacheRef.current.set(key, b);
              return b;
            })();

            const fgClass = textOnBg(bg);
            const bdClass = borderOnBg(bg);

            const titleNode = (
              <div className="grid grid-cols-2 gap-2 items-start">
                <div className="group-hover:translate-x-8 duration-500">
                  <div>{it.title}</div>
                  {it.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-MIAMgreytext">
                      {it.tags.map((t, i) => (
                        <span
                          key={`${key}-tag-${i}`}
                          className="px-2 py-0.5 border border-MIAMgreytext/40 rounded-full"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right text-sm text-MIAMgreytext">{it.dateRange}</div>
              </div>
            );

            const revealNode = it.thumbnail ? (
              <Image
                width={imageSize}
                height={imageSize}
                src={it.thumbnail}
                alt={it.title ?? "image"}
                className={clsx("rounded-full", blendClass, imageClassName)}
                unoptimized={unoptimizedImages}
                onError={() => {}}
              />
            ) : (
              <div
                className={clsx(
                  "w-28 h-28 rounded-full flex items-center justify-center text-xl font-semibold border",
                  fgClass,
                  bdClass
                )}
                aria-hidden
              >
                {initials(it.title)}
              </div>
            );

            return (
              <RevealRowClient
                type="archives"
                key={key}
                title={titleNode}
                href={it.href}
                arrow={arrow}
                rowClassName={rowClassName}
                titleClassName={titleClassName}
                revealPadding={revealPadding}
                sideClasses={sideClasses}
                bg={bg}s
                rowTextClassName="text-MIAMgreytext text-sm"
                revealTextClassName={fgClass}
                activateOnMobile={activateOnMobile}
                inViewMargin={inViewMargin}
                inViewAmount={inViewAmount}
              >
                {revealNode}
              </RevealRowClient>
            );
          })}
        </div>
      ))}
    </div>
  );
}
