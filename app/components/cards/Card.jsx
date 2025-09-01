"use client";
import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import CategoryPills from "../ui/CategoryPills";
import RichTextServer from "../ui/RichText";

const HOVER_BG_CLASSES = [
  "md:hover:bg-MIAMblack",
  "md:hover:bg-MIAMviolet",
  "hover:bg-MIAMtomato",
  "md:hover:bg-MIAMlime",
];

const MOBILE_BG_CLASSES = [
  "bg-MIAMblack",
  "bg-MIAMviolet",
  "bg-MIAMtomato",
  "bg-MIAMlime",
];

const Card = ({
  index,                // <-- passe l'index depuis le .map()
  locale,
  slug,
  title,
  thumbnail,
  startDate,
  contentBlocks= null,
  endDate,
  startTime,
  endTime,
  description,
  descriptionBlocks,
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
  const timeLabel = formatTimeRange(startTime, endTime);

  // Hover desktop aléatoire (inchangé)
  const hoverBgClass = useMemo(
    () => HOVER_BG_CLASSES[Math.floor(Math.random() * HOVER_BG_CLASSES.length)],
    []
  );

  // MOBILE: 1 carte sur 2 transparente (ici: index impair => transparent)
  const mobileBgClass = useMemo(() => {
    if (typeof index === "number" && index % 2 === 1) return "bg-transparent";
    return MOBILE_BG_CLASSES[Math.floor(Math.random() * MOBILE_BG_CLASSES.length)];
  }, [index]);

  // -------- Nouveautés demandées --------
  const isMobileBlack  = mobileBgClass === "bg-MIAMblack";
  const isMobileViolet = mobileBgClass === "bg-MIAMviolet";
  const isMobileTomato = mobileBgClass === "bg-MIAMtomato";

  // Texte/pills en blanc si fond rouge/violet/noir (mobile), et retour à normal en md+
  const baseTextClass =
    isMobileBlack || isMobileViolet || isMobileTomato
      ? "text-MIAMwhite md:text-inherit"
      : "";

  const basePillClass =
    isMobileBlack || isMobileViolet || isMobileTomato
      ? "border-MIAMwhite text-MIAMwhite md:border-MIAMblack md:text-MIAMblack"
      : "border-MIAMblack text-MIAMblack";

  // Image: si bg mobile = black => invert en base (et pas de mix-blend-darken)
  const imageBaseMobileClass = isMobileBlack ? "invert" : "mix-blend-darken";

  // -------------------------------------

  let hoverTextClass = "md:hover:text-MIAMblack";
  // par défaut on inverse au hover desktop ; si hover black desktop, pas de mix-blend-darken
  let imageHoverClass = "md:group-hover:invert duration-500";
  let categoryHoverClass = "md:group-hover:text-MIAMblack md:group-hover:border-MIAMblack";

  if (hoverBgClass === "md:hover:bg-MIAMblack") {
    hoverTextClass = "md:hover:text-MIAMwhite";
    imageHoverClass = "md:group-hover:mix-blend-lighten md:group-hover:invert duration-500";
    categoryHoverClass = "md:group-hover:text-MIAMwhite md:group-hover:border-MIAMwhite";
  } else if (hoverBgClass === "md:hover:bg-MIAMlime") {
    hoverTextClass = "md:hover:text-MIAMblack";
    categoryHoverClass = "md:group-hover:text-MIAMblack md:group-hover:border-MIAMblack";
  }

  const blocksForPreview =
    Array.isArray(descriptionBlocks) && descriptionBlocks.length > 0
      ? descriptionBlocks
      : (Array.isArray(contentBlocks) && contentBlocks.length > 0 ? contentBlocks : null);

  return (
    <Link href={`/${locale || "fr"}/events/${slug}`} className="block ">
      <article
        className={[
          "font-haas p-4 pb-8 group transition duration-500 cursor-pointer",
          "md:bg-transparent ", // desktop: transparent par défaut
          hoverBgClass,         // desktop: couleur au hover
          hoverTextClass,
          mobileBgClass,        // mobile: couleur aléatoire ou transparent 1/2
          baseTextClass,        // mobile: texte en blanc si bg tomato/violet/black
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
              imageBaseMobileClass, // mobile: invert si bg black, sinon mix-blend-darken
              imageHoverClass,      // desktop: comportement au hover (inchangé sauf black)
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
          <div className="pt-1 pb-4 prose prose-sm max-w-none line-clamp-3 [&_*]:!my-0">
            <RichTextServer value={blocksForPreview} />
          </div>
        ) : (
          description && (
            <p className="leading-tight block pt-1 pb-4 line-clamp-3">
              {description}
            </p>
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
