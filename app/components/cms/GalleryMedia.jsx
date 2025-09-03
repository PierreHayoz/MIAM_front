import Image from "next/image";
import { mediaSrc, mediaMime, mediaAlt } from "@/app/lib/media";

export default function GalleryMedia({ items = [] }) {
  if (!items?.length) return null;

  return (
    <div className="col-span-3 ">
      {items.map((m, i) => {
        const media = m.media || m.file || m.image || m.photo || m; // tolérant
        const src = mediaSrc(media);
        const mime = mediaMime(media);
        const isVideo = m.type === "video" || mime.startsWith("video/");
        const alt = m.caption || mediaAlt(media) || `media-${i}`;

        if (!src) return null; // rien à afficher

        return (
          <div key={i}>
            <div  className="relative py-4  ">
              {isVideo ? (
                <video controls className="w-full h-auto">
                  <source src={src} type={mime || undefined} />
                </video>
              ) : (
                <div className="relative w-full ">
                  <Image
                    src={src}
                    alt={m.caption}
                    width={1200}
                    height={800}
                    className="mix-blend-darken w-full h-auto"
                  />
                  <div className="text-xs w-full text-center">{m.caption}</div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
