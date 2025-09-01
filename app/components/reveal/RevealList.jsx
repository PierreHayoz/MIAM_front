// file: app/components/reveal/RevealList.jsx
import Image from "next/image";
import clsx from "clsx";

/**
 * Composant liste avec panneau "révélé" au survol (image/texte/avatar).
 * Garde le look & feel de ta page Archives (grille, flèche, hover, fond MIAM*).
 * Usage flexible via props + render props, sans rien casser.
 */

export const HOVER_BGS = ["bg-MIAMblack", "bg-MIAMviolet", "bg-MIAMtomato", "bg-MIAMlime"];

// petit hash stable
export function hashKey(key) {
  const s = String(key ?? "");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h >>> 0; // unsigned
}
export function pickBg(key, hoverBgs = HOVER_BGS) {
  const idx = hashKey(key) % hoverBgs.length;
  return hoverBgs[idx];
}

// util pour avatars
function initials(name = "?") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

export default function RevealList({
  items = [],
  /** (item, idx) => string|number */ getKey,
  /** (item) => string|ReactNode */ getTitle,
  /** (item) => string|undefined */ getHref,
  /** "image" | "text" | "avatar" */ variant = "image",
  /** (item) => string (url) — requis si variant=image ou avatar (avec photo) */ getThumbnail,
  /** (item) => string|ReactNode — utilisé si variant=text ou comme sous-titre */ getDescription,
  /** (item) => "image"|"text"|"avatar" — permet de mixer les variantes item par item */ getVariant,
  /** render prop prioritaire : (item, ctx) => ReactNode */ renderReveal,
  /** classes */
  containerClassName = "",
  rowClassName = "border-b border-MIAMgreytext py-2 group relative",
  titleClassName = "cursor-pointer group-hover:translate-x-8 duration-500",
  arrow = true,
  /** apparence du panneau révélé */
  revealSide = "right", // "right" | "left"
  revealPadding = "p-8",
  hoverBackgrounds = HOVER_BGS,
  imageSize = 300,
}) {
  const sideClasses = revealSide === "left" ? "left-0" : "right-0";

  return (
    <div className={containerClassName}>
      {items.map((item, idx) => {
        const key = getKey ? getKey(item, idx) : idx;
        const bg = pickBg(key, hoverBackgrounds);
        const v = getVariant ? getVariant(item) : variant;

        const blendClass = bg === "bg-MIAMblack" ? "mix-blend-lighten invert" : "mix-blend-darken";

        const titleNode = (() => {
          const title = typeof getTitle === "function" ? getTitle(item) : String(item);
          const href = getHref ? getHref(item) : undefined;
          if (href) {
            return (
              <a href={href} className={titleClassName}>
                {title}
              </a>
            );
          }
          return <div className={titleClassName}>{title}</div>;
        })();

        const defaultReveal = (() => {
          if (renderReveal) return renderReveal(item, { bg, blendClass, imageSize });

          if (v === "text") {
            const desc = getDescription ? getDescription(item) : "";
            return (
              <div className="max-w-xs leading-tight text-white">
                {typeof desc === "string" ? <p className="whitespace-pre-line">{desc}</p> : desc}
              </div>
            );
          }

          if (v === "avatar") {
            const url = getThumbnail ? getThumbnail(item) : undefined;
            const name = typeof getTitle === "function" ? getTitle(item) : undefined;
            return url ? (
              <Image
                width={imageSize}
                height={imageSize}
                src={url}
                alt={name || "avatar"}
                className={clsx("rounded-full", blendClass)}
              />
            ) : (
              <div className="w-28 h-28 rounded-full flex items-center justify-center text-xl font-semibold text-white/90 border border-white/30">
                {initials(String(name || "?"))}
              </div>
            );
          }

          // v === 'image' (par défaut)
          const url = getThumbnail ? getThumbnail(item) : undefined;
          const alt = typeof getTitle === "function" ? getTitle(item) : "image";
          if (!url) return null;
          return (
            <Image width={imageSize} height={imageSize} src={url} alt={String(alt)} className={blendClass} />
          );
        })();

        return (
          <div key={key} className={`${rowClassName}`}>
            <div className="flex items-center gap-2 w-full text-MIAMgreytext text-sm">
              {arrow && (
                <span className="opacity-0 group-hover:opacity-100 absolute -left-8 group-hover:left-0 duration-500 ">→</span>
              )}
              {titleNode}
            </div>

            {/* Panneau qui apparaît au hover */}
            <div
              className={clsx(
                "absolute top-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                revealPadding,
                sideClasses,
                bg,
              )}
            >
              {defaultReveal}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ------------------------------------------------------------
// EXEMPLES D'UTILISATION
// ------------------------------------------------------------

/*
// file: app/archives/page.jsx (remplace le bloc listant events)
import { getEvents } from "../lib/events";
import RevealList from "../components/reveal/RevealList";

export default async function Page() {
  const events = await getEvents();
  return (
    <section>
      <div className="grid grid-cols-4 px-4">
        <h2 className="text-3xl">Archives</h2>
        <RevealList
          items={events}
          getKey={(e) => e.slug ?? e.id}
          getTitle={(e) => e.title}
          getHref={(e) => `/events/${e.slug ?? e.id}`}
          variant="image"
          getThumbnail={(e) => e.thumbnail}
          // optionnel: mixer les variantes item par item
          // getVariant={(e) => (e.thumbnail ? 'image' : 'text')}
        />
      </div>
    </section>
  );
}
*/

/*
// file: app/glossaire/page.jsx (extrait)
import RevealList from "../components/reveal/RevealList";
import { getGlossary } from "../lib/glossary"; // à adapter à ta source

export default async function Page() {
  const terms = await getGlossary(); // [{ slug, term, definition }]
  return (
    <section>
      <div className="grid grid-cols-4 px-4">
        <h2 className="text-3xl">Glossaire</h2>
        <RevealList
          items={terms}
          getKey={(t) => t.slug ?? t.term}
          getTitle={(t) => t.term}
          variant="text"
          getDescription={(t) => t.definition}
        />
      </div>
    </section>
  );
}
*/

/*
// file: app/association/page.jsx (extrait)
import RevealList from "../components/reveal/RevealList";
import { getMembers } from "../lib/members"; // à adapter

export default async function Page() {
  const members = await getMembers(); // [{ id, name, role, photo }]
  return (
    <section>
      <div className="grid grid-cols-4 px-4">
        <h2 className="text-3xl">Association</h2>
        <RevealList
          items={members}
          getKey={(m) => m.id}
          getTitle={(m) => m.name}
          getDescription={(m) => m.role}
          variant="avatar"
          getThumbnail={(m) => m.photo}
          // Si tu veux montrer avatar + rôle en même temps :
          // renderReveal={(m, { blendClass }) => (
          //   <div className="flex items-center gap-4">
          //     {m.photo ? (
          //       <Image width={100} height={100} src={m.photo} alt={m.name} className={clsx('rounded-full', blendClass)} />
          //     ) : (
          //       <div className="w-16 h-16 rounded-full flex items-center justify-center text-white border border-white/30">
          //         {initials(m.name)}
          //       </div>
          //     )}
          //     <div className="text-white max-w-xs leading-tight">
          //       <div className="font-medium">{m.name}</div>
          //       <div className="opacity-80">{m.role}</div>
          //     </div>
          //   </div>
          // )}
        />
      </div>
    </section>
  );
}
*/

/*
// Optionnel : re-export pratique
// file: app/components/reveal/index.js
export { default as RevealList } from "./RevealList";
export { HOVER_BGS, hashKey, pickBg } from "./RevealList";
*/
