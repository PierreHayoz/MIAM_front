import React from "react";
import Image from "next/image";
import clsx from "clsx";
import RevealList from "../reveal/RevealList";
import { mediaURL } from "../../lib/strapi";

function initials(name = "?") {
  return String(name).split(/\s+/).filter(Boolean).slice(0,2).map(s => s[0]?.toUpperCase()).join("");
}

// helpers
const pickLabel = (m) => m.label ?? m.name ?? m.title ?? m.term ?? "";
const pickDescription = (m) => m.description ?? m.role ?? m.definition ?? "";
const pickThumb = (m) =>
  mediaURL(m.photo) || mediaURL(m.thumbnail) || mediaURL(m.image) ||
  m.photo || m.thumbnail || m.image || "";

const Paragraphs = ({
  title,
  text,
  type,
  subtitle,
  items = [],
  getKey = (m, i) => m.id ?? m.slug ?? pickLabel(m) ?? i,
  getTitle,
  getThumbnail = pickThumb,
  getDescription = pickDescription,
  getHref,
  variant = "avatar",
  revealProps = {},
}) => {
  // 👉 CAS NON-LISTE — il faut retourner ici
  if (type !== "list") {
    return (
      <div>
        {title && <h2 className="text-xl text-MIAMblack">{title}</h2>}
        {subtitle && <h3 className="text-sm text-MIAMgreytext pt-1">{subtitle}</h3>}
        {text && <p className="text-sm text-MIAMgreytext pt-2">{text}</p>}
      </div>
    );
  }

  // Tolérance: si jamais Strapi renvoie un objet style { data: [...] }
  const normalizedItems = Array.isArray(items)
    ? items
    : Array.isArray(items?.data)
      ? items.data
      : [];

  const hasItems = normalizedItems.length > 0;

  const defaultGetTitle = (m) => {
    const hasThumb = !!pickThumb(m);
    if (!hasThumb || variant === "text") {
      return <span>{pickLabel(m)}</span>;
    }
    return (
      <div className="grid grid-cols-2 w-full">
        <span>{pickLabel(m)}</span>
        <span className="text-MIAMgreytext">{pickDescription(m)}</span>
      </div>
    );
  };

  const defaultAvatarReveal = (m, { blendClass }) => (
    <div className="flex items-center gap-4">
      {pickThumb(m) ? (
        <Image
          width={100}
          height={100}
          src={pickThumb(m)}
          alt={pickLabel(m) || "avatar"}
          className={clsx("rounded-full", blendClass)}
        />
      ) : null}
      <div className="text-white max-w-xs leading-tight">
        <div className="font-medium">{pickLabel(m)}</div>
        {pickDescription(m) && <div className="opacity-80">{pickDescription(m)}</div>}
      </div>
    </div>
  );

  const defaultTextReveal = (m) => (
    <div className="text-white max-w-sm leading-tight">
      <div className="font-medium">{pickLabel(m)}</div>
      {pickDescription(m) && <div className="opacity-80">{pickDescription(m)}</div>}
    </div>
  );

  const mergedRevealProps = !revealProps.renderReveal
    ? { ...revealProps, renderReveal: variant === "avatar" ? defaultAvatarReveal : defaultTextReveal }
    : revealProps;

  return (
    <div>
      {title && <h2 className="text-xl text-MIAMblack">{title}</h2>}
      {subtitle && <h3 className="text-sm text-MIAMgreytext pt-1">{subtitle}</h3>}
      {text && <p className="text-sm text-MIAMgreytext pt-2">{text}</p>}

      {hasItems ? (
        <RevealList
          items={normalizedItems}
          getKey={getKey}
          getTitle={getTitle ?? defaultGetTitle}
          getHref={getHref}
          variant={variant}
          getThumbnail={getThumbnail}
          getDescription={getDescription}
          containerClassName="relative text-sm"
          rowClassName="border-b py-2 group relative"
          titleClassName="cursor-pointer group-hover:translate-x-8 w-full duration-500"
          {...mergedRevealProps}
        />
      ) : (
        <div className="pt-2 text-MIAMgreytext text-sm opacity-70">(Aucun élément)</div>
      )}
    </div>
  );
};

export default Paragraphs;
