// app/components/archives/ArchivesListClient.jsx
"use client";

import Image from "next/image";
import clsx from "clsx";
import RevealRowClient from "@/app/components/reveal/RevealRowClient";

// mêmes helpers/couleurs que RevealList
const HOVER_BGS = ["bg-MIAMblack", "bg-MIAMviolet", "bg-MIAMtomato", "bg-MIAMlime"];
const textOnBg = (bg) => (bg === "bg-MIAMlime" ? "text-MIAMblack" : "text-white");
const borderOnBg = (bg) => (bg === "bg-MIAMlime" ? "border-black/30" : "border-white/30");
const blendFor = (bg) => (bg === "bg-MIAMblack" ? "mix-blend-lighten invert" : "mix-blend-darken");

function hashKey(key) { const s = String(key ?? ""); let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h >>> 0; }
function pickBg(key) { const i = hashKey(key) % HOVER_BGS.length; return HOVER_BGS[i]; }
function initials(name = "?") {
  return String(name).split(/\s+/).filter(Boolean).slice(0, 2).map(s => s[0]?.toUpperCase()).join("");
}

/**
 * Props (toutes sérialisables):
 * groups: [{ year, items: [{ key, href, title, tags[], dateRange, thumbnail }] }]
 */
export default function ArchivesListClient({
  groups = [],
  // options pour obtenir le *même rendu* que RevealList
  containerClassName = "",
  rowClassName = "border-b border-MIAMgreytext py-2 group relative",
  titleClassName = "cursor-pointer group-hover:translate-x-8 duration-500",
  revealSide = "right",                // "left" possible si tu veux
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

  return (
    <div className={containerClassName}>
      {groups.map(({ year, items }) => (
        <div key={year} className="space-y-2 mb-10">
          <h3 className="text-xl mb-2 opacity-70">{year}</h3>

          {items.map((it, idx) => {
            const key = it.key ?? idx;
            const bg = pickBg(key);
            const blendClass = blendFor(bg);
            const fgClass = textOnBg(bg);
            const bdClass = borderOnBg(bg);

            // Titre identique à ton getTitle existant (titre + tags + date à droite)
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

            // Contenu “révélé” (image ronde blend/invert, sinon fallback initiales)
            const revealNode = it.thumbnail ? (
              <Image
                width={imageSize}
                height={imageSize}
                src={it.thumbnail}
                alt={it.title ?? "image"}
                className={clsx("", blendClass, imageClassName)}
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
          })}
        </div>
      ))}
    </div>
  );
}
