// app/components/glossaire/GlossaireList.jsx
import Image from "next/image";
import RichTextServer from "../ui/RichText";
import RevealList, { pickBg } from "../reveal/RevealList"; // 👈 importe tes helpers

const mediaUrl = (m) => {
  const url =
    m?.data?.attributes?.url ??
    m?.attributes?.url ??
    m?.url ??
    null;
  if (!url) return null;
  const base = process.env.NEXT_PUBLIC_STRAPI_URL?.replace(/\/$/, "") || "";
  return url.startsWith("http") ? url : `${base}${url}`;
};

export default function GlossaireList({ items = [], heading, intro }) {
  const list = Array.isArray(items?.data) ? items.data : Array.isArray(items) ? items : [];
  if (!list.length) return null;

  // mapping unique pour tes items
  const getKey = (entry) => entry?.id ?? entry?.documentId ?? JSON.stringify(entry);
  const getTitle = (entry) => {
    const a = entry?.attributes ?? entry;
    return a?.nom ?? a?.name ?? a?.title ?? "—";
  };
  const getDescription = (entry) => {
    const a = entry?.attributes ?? entry;
    return a?.definition ?? a?.description ??  a?.presentation ?? "";
  };
  const getThumbnail = (entry) => {
    const a = entry?.attributes ?? entry;
    return mediaUrl(a?.image ?? a?.photo ?? a?.media ?? a?.illustration ?? a?.cover);
  };
  const getHref = () => undefined; // pas de lien pour l’instant

  // contenu du popover (image + texte)
  const renderReveal = (entry, { bg, blendClass, imageSize, fgClass, bdClass }) => {
    const title = getTitle(entry);
    const desc = getDescription(entry);
    const thumb = getThumbnail(entry);

    return (
      <div className="w-60">
        {thumb ? (
          <div className="relative overflow-hidden rounded-lg w-full">
            <Image
              src={thumb}
              alt={title}
              width={150}
              height={150}
              sizes="320px"
            />
          </div>
        ) : null}

        <div className="mt-3 w-full">
          <h4 className="text-sm font-semibold">{title}</h4>
          <div className="prose prose-sm max-w-none mt-1">
            {typeof desc === "string" ? (
              <div dangerouslySetInnerHTML={{ __html: desc }} />
            ) : desc ? (
              <RichTextServer value={desc} tone="inherit" />
            ) : (
              <p className="opacity-80">—</p>
            )}
          </div>
        </div>

      </div>
    );
  };

  return (
    <section className="mt-8">
      {heading ? <h2 className="text-xl md:col-span-1 col-span-4">{heading}</h2> : null}
      <RevealList
        items={list}
        getKey={getKey}
        getTitle={getTitle}
        getHref={getHref}
        getThumbnail={getThumbnail}
        getDescription={getDescription}
        renderReveal={renderReveal}
        containerClassName="px-4 mt-4"
        rowClassName="border-b border-MIAMgreytext py-2 group relative"
        titleClassName="cursor-pointer group-hover:translate-x-8 duration-500"
        arrow={true}
        revealSide="right"         // popover côté droit
        revealPadding="p-4"        // padding du popover
        imageSize={300}
        activateOnMobile={true}    // auto-révélation en viewport sur mobile
        inViewMargin="-35% 0px -35% 0px"
        inViewAmount={0.3}
        unoptimizedImages={false}
      />
    </section>
  );
}
