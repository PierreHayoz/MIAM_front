import Image from "next/image";
import { mediaSrc, mediaMime, mediaAlt } from "@/app/lib/media";

export default function GalleryMedia({ items = [] }) {
  if (!items?.length) return null;

  return (
    <>
      {items.map((m, i) => {
        const media = m.media || m.file || m.image || m.photo || m; // tolérant
        const src = mediaSrc(media);
        const mime = mediaMime(media);
        const isVideo = m.type === "video" || mime.startsWith("video/");
        const alt = m.caption || mediaAlt(media) || `media-${i}`;

        if (!src) return null; // rien à afficher

        return (
          <div key={i} className="relative py-4 col-span-3 not-even:col-span-2 not-odd:col-start-2">
            {isVideo ? (
              <video controls className="w-full h-auto">
                <source src={src} type={mime || undefined} />
              </video>
            ) : (
              <div className="relative group">
                <Image
                  src={src}
                  alt={alt}
                  width={1200}
                  height={800}
                  className="mix-blend-difference w-full h-auto"
                />
              </div>
            )}
            {m.caption && (
              <div className="mt-2 text-xs text-MIAMgreytext">{m.caption}</div>
            )}
          </div>
        );
      })}
    </>
  );
}
