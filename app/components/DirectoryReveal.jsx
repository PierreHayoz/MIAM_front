// app/components/directory/DirectoryReveal.jsx
// Server component
import Image from "next/image";
import RichTextServer from "./ui/RichText";
import RevealList from "./reveal/RevealList";

export default function DirectoryReveal({
    items = [],
    heading,
    getters = {},
    imageWidth = 200,
    imageHeight = 200,
}) {
    const list = Array.isArray(items?.data) ? items.data : Array.isArray(items) ? items : [];
    if (!list.length) return null;

    // safe getters + fallbacks
    const getKey = (e, i) => getters.getKey?.(e, i) ?? e?.id ?? e?.documentId ?? JSON.stringify(e);
    const getName = (e) => getters.getName?.(e) ?? "—";
    const getInline = (e) => getters.getInline?.(e) ?? ""; // ex: position
    const getDescription = (e) => getters.getDescription?.(e) ?? "";
    const getThumbnail = (e) => getters.getThumbnail?.(e) ?? undefined;
    const getHref = (e) => getters.getHref?.(e) ?? undefined;

    const getTitle = (entry) => {
       const name = getName(entry);
        return name
    };
    
    const renderReveal = (entry) => {
        const name = getName(entry);
        const inline = getInline(entry);
        const desc = getDescription(entry);
        const thumb = getThumbnail(entry);

        return (
            <div >
                {thumb && (
                    <div className="relative overflow-hidden rounded-lg w-full mb-3">
                        <Image
                            src={thumb}
                            alt={name}
                            width={imageWidth}
                            height={imageHeight}
                            className="mix-blend"
                        />
                    </div>
                )}
                <h4 className=" font-semibold">{name}</h4>
                {inline ? <div className="text-xs opacity-70 mb-2">{inline}</div> : null}

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
            {heading ? <h2 className="text-xl mb-4 px-4">{heading}</h2> : null}
            <RevealList
                items={list}
                getKey={getKey}
                getTitle={getTitle}          // base list: nom (+ position si fournie)
                getHref={getHref}
                getThumbnail={(e) => getThumbnail(e)} // pas utilisé si renderReveal est fourni
                getDescription={(e) => getDescription(e)}
                renderReveal={renderReveal}  // popover détaillé
                containerClassName="px-4 md:px-0 mt-4"
                rowClassName="border-b border-MIAMgreytext py-2 group relative"
                titleClassName="cursor-pointer group-hover:translate-x-8 duration-500"
                arrow={true}
                revealSide="right"
                revealPadding="p-4"
                imageSize={imageWidth}
                unoptimizedImages={true}
                activateOnMobile={true}
                inViewMargin="-35% 0px -35% 0px"
                inViewAmount={0.3}
            />
        </section>
    );
}


export const mapStrapi = {
    getAttrs: (entry) => entry?.attributes ?? entry,
    getMediaUrl: (m) => {
        const url =
            m?.data?.attributes?.url ??
            m?.attributes?.url ??
            m?.url ??
            null;
        if (!url) return null;
        const base = process.env.NEXT_PUBLIC_STRAPI_URL?.replace(/\/$/, "") || "";
        return url.startsWith("http") ? url : `${base}${url}`;
    },
};
