// app/components/reveal/RevealListClient.jsx
"use client";

import Image from "next/image";
import clsx from "clsx";
import RevealRowClient from "./RevealRowClient";

export default function RevealListClient({
  items = [],                       // [{ key, href, titleNode, dateRange, tags, thumbnail, imageSize }]
  containerClassName = "",
  rowClassName = "border-b border-MIAMgreytext py-2 group relative",
  titleClassName = "cursor-pointer group-hover:translate-x-8 duration-500",
  arrow = true,
  revealSide = "right",
  revealPadding = "p-8",
  imageClassName = "",
  unoptimizedImages = false,
}) {
  const sideClasses = revealSide === "left" ? "left-0" : "right-0";

  return (
    <div className={containerClassName}>
      {items.map((it) => (
        <RevealRowClient
          key={it.key}
          title={it.titleNode ?? it.title ?? ""}
          href={it.href}
          arrow={arrow}
          rowClassName={rowClassName}
          titleClassName={titleClassName}
          revealPadding={revealPadding}
          sideClasses={sideClasses}
          bg={it.bg}
          rowTextClassName="text-MIAMgreytext text-sm"
          revealTextClassName={it.revealTextClassName}
          activateOnMobile={it.activateOnMobile ?? true}
          inViewMargin={it.inViewMargin ?? "-35% 0px -35% 0px"}
          inViewAmount={it.inViewAmount ?? 0.3}
        >
          {it.thumbnail ? (
            <Image
              width={it.imageSize ?? 300}
              height={it.imageSize ?? 300}
              src={it.thumbnail}
              alt={typeof it.title === "string" ? it.title : "image"}
              className={clsx("rounded-full", it.blendClass, imageClassName)}
              unoptimized={unoptimizedImages}
              onError={() => { /* optionnel : fallback */ }}
            />
          ) : (
            <div className={clsx("w-28 h-28 rounded-full flex items-center justify-center text-xl font-semibold", it.fgClass, it.bdClass, "border")}>
              {it.initials ?? "?"}
            </div>
          )}
        </RevealRowClient>
      ))}
    </div>
  );
}
