"use client";
import { useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import CategoryPills from "../ui/CategoryPills";

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
  return (Math.random() * 0xffffffff) >>> 0;
}

/** ====== Utils preview texte ====== */
function safeTruncate(input, max = 120) {
  if (!input) return "";
  const s = input.replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;

  const lowerBound = Math.floor(max * 0.7);
  let cut = s.lastIndexOf(" ", max);
  if (cut < lowerBound) cut = max;
  return s.slice(0, cut).trimEnd() + "…";
}

function blocksToPlainText(blocks) {
  if (!blocks) return "";

  const collect = (node, out = []) => {
    if (!node) return out;

    if (Array.isArray(node)) {
      node.forEach((n) => collect(n, out));
      return out;
    }

    if (typeof node === "object") {
      if (typeof node.text === "string") out.push(node.text);
      if (Array.isArray(node.children)) node.children.forEach((c) => collect(c, out));
      if (typeof node.value === "string") out.push(node.value);
      if (Array.isArray(node.content)) node.content.forEach((c) => collect(c, out));

      if (node._type === "block" && Array.isArray(node.children)) {
        const text = node.children.map((c) => c.text || "").join("");
        if (text) out.push(text);
      }

      for (const key in node) {
        if (["children", "content", "text", "value"].includes(key)) continue;
        const v = node[key];
        if (Array.isArray(v) || (typeof v === "object" && v !== null)) collect(v, out);
      }
    }
    return out;
  };

  return collect(blocks, []).join(" ").replace(/\s+/g, " ").trim();
}
// Dans Card.jsx, ajoute ce helper (copie allégée de ta page event)
function doorOpeningToTime(door, locale) {
  if (!door) return null;
  // cas 1: doorOpening déjà string "HH:mm"
  if (typeof door === "string" && /^\d{1,2}:\d{2}$/.test(door)) return door;

  // cas 2: objet normalisé { time, iso, ... }
  if (door && typeof door === "object") {
    if (typeof door.time === "string" && /^\d{1,2}:\d{2}$/.test(door.time)) return door.time;
    if (door.iso) {
      try {
        return new Date(door.iso).toLocaleTimeString(
          (locale || "fr").startsWith("fr") ? "fr-CH" : locale,
          { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich" }
        );
      } catch {}
    }
  }
  return null;
}

const Card = ({
  index,
  locale,
  slug,
  title,
  thumbnail,
  startDate,
  endDate,
  startTime,
  endTime,
  description,
  doorOpening,
  descriptionBlocks,
  contentBlocks = null,
  categories = [],
}) => {
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

// 1) on extrait une vraie string HH:mm depuis doorOpening (objet ou string)
const doorOpeningTime = doorOpeningToTime(doorOpening, locale);

// 2) Affichage voulu: doorOpening → endTime
//    Fallback (optionnel) : si pas de doorOpening, on retombe sur startTime → endTime
const timeLabel = doorOpeningTime
  ? formatTimeRange(doorOpeningTime, endTime)
  : formatTimeRange(startTime, endTime); // <-- retire ce fallback si tu préfères afficher rien


  const hoverIdxRef = useRef(null);
  if (hoverIdxRef.current === null) {
    let r = randUint();
    let idx = r % HOVER_BG_CLASSES.length;
    if (HOVER_BG_CLASSES[idx] === "md:hover:bg-MIAMblack") {
      r = randUint();
      idx = r % HOVER_BG_CLASSES.length;
    }
    hoverIdxRef.current = idx;
  }
  const hoverBgClass = HOVER_BG_CLASSES[hoverIdxRef.current];

  const mobileIdxRef = useRef(null);
  if (mobileIdxRef.current === null) {
    mobileIdxRef.current = randUint() % MOBILE_BG_CLASSES.length;
  }
  const mobileBgClass =
    typeof index === "number" && index % 2 === 1
      ? "bg-transparent"
      : MOBILE_BG_CLASSES[mobileIdxRef.current];

  const isMobileDark = ["bg-MIAMblack", "bg-MIAMviolet", "bg-MIAMtomato"].includes(mobileBgClass);
  const baseTextClass = isMobileDark ? "text-MIAMwhite md:text-MIAMblack" : "text-MIAMblack";
  const basePillClass = isMobileDark
    ? "border-MIAMwhite text-MIAMwhite md:border-MIAMblack md:text-MIAMblack"
    : "border-MIAMblack text-MIAMblack";

  const imageBaseMobileClass =
    mobileBgClass === "bg-MIAMblack" ? "mix-blend-lighten md:mix-blend-darken" : "mix-blend-darken";

  let hoverTextClass = "md:hover:text-MIAMblack";
  let imageHoverClass = "md:group-hover:invert duration-500";
  let categoryHoverClass = "md:group-hover:text-MIAMblack md:group-hover:border-MIAMblack";

  if (hoverBgClass === "md:hover:bg-MIAMblack") {
    hoverTextClass = "md:hover:text-MIAMwhite";
    imageHoverClass = "md:group-hover:mix-blend-lighten md:group-hover:invert duration-500";
    categoryHoverClass = "md:group-hover:text-MIAMwhite md:group-hover:border-MIAMwhite";
  } else if (
    hoverBgClass === "md:hover:bg-MIAMviolet" ||
    hoverBgClass === "md:hover:bg-MIAMtomato"
  ) {
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

  const previewText = useMemo(() => {
    if (typeof description === "string" && description.trim().length > 0) {
      return safeTruncate(description, 120);
    }
    if (blocksForPreview) {
      const plain = blocksToPlainText(blocksForPreview);
      return safeTruncate(plain, 120);
    }
    return "";
  }, [description, blocksForPreview]);

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
              imageBaseMobileClass,
              imageHoverClass,
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

        {previewText && (
          <p className="pt-1 pb-4 prose prose-sm max-w-none text-inherit [&_*]:text-inherit [&_*]:!my-0">
            {previewText}
          </p>
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
