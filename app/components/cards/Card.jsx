"use client";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import CategoryPills from "../ui/CategoryPills";
import RichTextServer from "../ui/RichText";

/** Desktop hover classes (cohérentes ≥ md) */
const HOVER_BG_CLASSES = [
  "md:hover:bg-MIAMblack",
  "md:hover:bg-MIAMviolet",
  "md:hover:bg-MIAMtomato",
  "md:hover:bg-MIAMlime",
];

const MOBILE_BG_CLASSES = [
  "bg-MIAMblack",
  "bg-MIAMviolet",
  "bg-MIAMtomato",
  "bg-MIAMlime",
];

/** RNG: crypto si dispo, sinon Math.random */
function randUint() {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const a = new Uint32Array(1);
    crypto.getRandomValues(a);
    return a[0] >>> 0;
  }
  // fallback
  return (Math.random() * 0xffffffff) >>> 0;
}
const pickR = (arr, r) => arr[r % arr.length];

const Card = ({
  index,
  id,
  locale,
  slug,
  title,
  thumbnail,
  startDate,
  endDate,
  startTime,
  endTime,
  description,
  descriptionBlocks,
  contentBlocks = null,
  categories = [],
}) => {
  /** ====== Formatages ====== */
  const formatDateRange = (s, e) => {
    if (!s) return null;
    const fmt = new Intl.DateTimeFormat("fr-CH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Europe/Zurich",
    });
    const start = fmt.format(new Date(s));
    if (!e || e === s) return start;
    const end = fmt.format(new Date(e));
    return `${start} → ${end}`;
  };
  const formatTimeRange = (s, e) => {
    if (!s && !e) return null;
    if (s && e) return `${s} – ${e}`;
    return s || e || null;
  };

  const dateLabel = formatDateRange(startDate, endDate);
  const timeLabel = formatTimeRange(startTime, endTime);

  /** ====== Tirages aléatoires (stables par carte via useRef) ====== */
  // Hover desktop : tirage + “reroll” si noir pour varier
  const hoverIdxRef = useRef(null);
  if (hoverIdxRef.current === null) {
    let r = randUint();
    let idx = r % HOVER_BG_CLASSES.length;
    if (HOVER_BG_CLASSES[idx] === "md:hover:bg-MIAMblack") {
      r = randUint(); // reroll 1x si noir
      idx = r % HOVER_BG_CLASSES.length;
    }
    hoverIdxRef.current = idx;
  }
  const hoverBgClass = HOVER_BG_CLASSES[hoverIdxRef.current];

  // Mobile background : conserver 1/2 transparent (index impair), sinon couleur aléatoire
  const mobileIdxRef = useRef(null);
  if (mobileIdxRef.current === null) {
    mobileIdxRef.current = randUint() % MOBILE_BG_CLASSES.length;
  }
  const mobileBgClass =
    typeof index === "number" && index % 2 === 1
      ? "bg-transparent"
      : MOBILE_BG_CLASSES[mobileIdxRef.current];

  // Dérivés
  const isMobileDark = ["bg-MIAMblack", "bg-MIAMviolet", "bg-MIAMtomato"].includes(mobileBgClass);
  const baseTextClass = isMobileDark ? "text-MIAMwhite md:text-MIAMblack" : "text-MIAMblack";
  const basePillClass = isMobileDark
    ? "border-MIAMwhite text-MIAMwhite md:border-MIAMblack md:text-MIAMblack"
    : "border-MIAMblack text-MIAMblack";

  // Mobile: si fond noir -> lighten, sinon darken
  const imageBaseMobileClass =
    mobileBgClass === "bg-MIAMblack" ? "mix-blend-lighten md:mix-blend-darken" : "mix-blend-darken";

  // Variantes desktop au hover selon la couleur tirée
  let hoverTextClass = "md:hover:text-MIAMblack";
  let imageHoverClass = "md:group-hover:invert duration-500";
  let categoryHoverClass = "md:group-hover:text-MIAMblack md:group-hover:border-MIAMblack";

  if (hoverBgClass === "md:hover:bg-MIAMblack") {
    hoverTextClass = "md:hover:text-MIAMwhite";
    imageHoverClass = "md:group-hover:mix-blend-lighten md:group-hover:invert duration-500";
    categoryHoverClass = "md:group-hover:text-MIAMwhite md:group-hover:border-MIAMwhite";
  } else if (hoverBgClass === "md:hover:bg-MIAMviolet" || hoverBgClass === "md:hover:bg-MIAMtomato") {
    hoverTextClass = "md:hover:text-MIAMwhite";
    categoryHoverClass = "md:group-hover:text-MIAMwhite md:group-hover:border-MIAMwhite";
  } else if (hoverBgClass === "md:hover:bg-MIAMlime") {
    hoverTextClass = "md:hover:text-MIAMblack";
    imageHoverClass = "md:group-hover:mix-blend-darken md:group-hover:invert duration-500";
    categoryHoverClass = "md:group-hover:text-MIAMblack md:group-hover:border-MIAMblack";
  }

  const blocksForPreview =
    Array.isArray(descriptionBlocks) && descriptionBlocks.length > 0
      ? descriptionBlocks
      : Array.isArray(contentBlocks) && contentBlocks.length > 0
      ? contentBlocks
      : null;

  const href = {
    pathname: `/${locale || "fr"}/events/${slug}`,
    query: startDate ? { on: startDate } : undefined,
  };

  return (
    <Link href={href} className="block">
      <article
        className={[
          "font-haas p-4 pb-8 group transition duration-500 cursor-pointer",
          "md:bg-transparent",
          hoverBgClass,
          hoverTextClass,
          mobileBgClass,
          baseTextClass,
        ].join(" ")}
      >
        <h2 className="mb-2">{title}</h2>

        {thumbnail && (
          <Image
            src={thumbnail}
            width={800}
            height={800}
            alt={title}
            className={[
              "transition duration-500",
              imageBaseMobileClass, // mobile behavior (lighten si noir)
              imageHoverClass,      // desktop hover behavior
            ].join(" ")}
            sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
          />
        )}

        {(dateLabel || timeLabel) && (
          <div className="flex justify-between w-full gap-2 mt-2">
            <span>{dateLabel}</span>
            {timeLabel && <span>{timeLabel}</span>}
          </div>
        )}

        {blocksForPreview ? (
          <div className="pt-1 pb-4 prose prose-sm max-w-none line-clamp-3 text-inherit [&_*]:text-inherit [&_*]:!my-0">
            {/* @ts-expect-error Server Component in Client boundary allowed by Next */}
            <RichTextServer value={blocksForPreview} tone="inherit" />
          </div>
        ) : (
          description && (
            <p className="leading-tight block line-clamp-3 text-inherit">{description}</p>
          )
        )}

        <CategoryPills
          categories={categories}
          pillClass={basePillClass}
          hoverClass={categoryHoverClass}
        />
      </article>
    </Link>
  );
};

export default Card;
