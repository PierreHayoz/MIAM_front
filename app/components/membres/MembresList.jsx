// app/components/membres/MembresList.jsx
import Image from "next/image";
import RichTextServer from "../ui/RichText";
import RevealList from "../reveal/RevealList";

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

export default function MembresList({ items = [], heading }) {
  const list = Array.isArray(items?.data) ? items.data : Array.isArray(items) ? items : [];
  if (!list.length) return null;

  // mapping adapté aux membres
  const getKey = (entry) => entry?.id ?? entry?.documentId ?? JSON.stringify(entry);
  const getTitle = (entry) => {
    const a = entry?.attributes ?? entry;
    const name = a?.nom ?? a?.name ?? "—";
    const pos = a?.position ?? "";
    return pos ? `${name} — ${pos}` : name;   // ✅ affiche Nom + Position directement
  };
  const getDescription = (entry) => {
    const a = entry?.attributes ?? entry;
    return a?.presentation ?? a?.description ?? "";
  };
  const getThumbnail = (entry) => {
    const a = entry?.attributes ?? entry;
    return mediaUrl(a?.photo ?? a?.image);
  };
  const getHref = () => undefined;

  const renderReveal = (entry) => {
    const a = entry?.attributes ?? entry;
    const title = a?.nom ?? a?.name ?? "—";
    const pos = a?.position ?? "";
    const desc = a?.presentation ?? "";
    const thumb = mediaUrl(a?.photo);

    return (
      <div className="w-72">
        {thumb && (
          <div className="relative overflow-hidden rounded-lg w-full mb-3">
            <Image
              src={thumb}
              alt={title}
              width={200}
              height={200}
              className="object-cover rounded-lg"
            />
          </div>
        )}

        <h4 className="text-sm font-semibold">{title}</h4>
        {pos && <div className="text-xs opacity-70 mb-2">{pos}</div>}

        <div className="prose prose-sm max-w-none">
          {typeof desc === "string" ? (
            <div dangerouslySetInnerHTML={{ __html: desc }} />
          ) : desc ? (
            <RichTextServer value={desc} tone="inherit" />
          ) : (
            <p className="opacity-50">—</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <section className="mt-8">
      {heading ? <h2 className="text-xl mb-4">{heading}</h2> : null}
      <RevealList
        items={list}
        getKey={getKey}
        getTitle={getTitle}      // 👉 nom + position visibles dans la liste
        getHref={getHref}
        getThumbnail={getThumbnail}
        getDescription={getDescription}
        renderReveal={renderReveal} // 👉 image + présentation détaillée
        containerClassName="px-4 mt-4"
        rowClassName="border-b border-MIAMgreytext py-2 group relative"
        titleClassName="cursor-pointer group-hover:translate-x-8 duration-500"
        arrow={true}
        revealSide="right"
        revealPadding="p-4"
        imageSize={200}
        activateOnMobile={true}
        inViewMargin="-35% 0px -35% 0px"
        inViewAmount={0.3}
      />
    </section>
  );
}
