// app/components/cards/Card.jsx
"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import CategoryPills from "../ui/CategoryPills";

/** Classes de fond au hover (desktop) et mobile */
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

/** Hash déterministe (évite l’aléatoire SSR/Client) */
function djb2(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
  return h >>> 0;
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

  // 🔒 labels pré-calculés côté serveur (pour éviter les mismatches d’hydratation)
  dateLabel,
  timeLabel,

  // pour le hachage stable
  __occKey,
}) => {
  // ---- Styles déterministes (pas d’aléatoire au render) ----
  const seed = djb2(`${__occKey || slug || title}|${index ?? 0}`);

  const hoverBgClass = HOVER_BG_CLASSES[seed % HOVER_BG_CLASSES.length];
  const mobileBgClass =
    typeof index === "number" && index % 2 === 1
      ? "bg-transparent"
      : MOBILE_BG_CLASSES[(seed >>> 3) % MOBILE_BG_CLASSES.length];

  const isMobileDark = ["bg-MIAMblack", "bg-MIAMviolet", "bg-MIAMtomato"].includes(mobileBgClass);
  const baseTextClass = isMobileDark ? "text-MIAMwhite md:text-MIAMblack" : "text-MIAMblack";
  const basePillClass = isMobileDark
    ? "border-MIAMwhite text-MIAMwhite md:border-MIAMblack md:text-MIAMblack"
    : "border-MIAMblack text-MIAMblack";

  // image blend selon le fond
  const imageBaseMobileClass =
    mobileBgClass === "bg-MIAMblack" ? "mix-blend-lighten md:mix-blend-darken" : "mix-blend-darken";

  // variations au hover selon la couleur
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

  // ---- Extrait un texte de preview (déterministe) ----
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
    // description/blocksForPreview sont stables d’un render à l’autre
  }, [description, blocksForPreview]);

  // ---- Lien vers l’event (préserve la date d’occurrence via `on`) ----
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
            className={["transition duration-500", imageBaseMobileClass, imageHoverClass].join(" ")}
            sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
            priority={false}
          />
        )}

        {(dateLabel || timeLabel) && (
          <p className="mt-2">
            {dateLabel}
            {timeLabel ? ` · ${timeLabel}` : ""}
          </p>
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
