import Image from "next/image";
import { mediaURL } from '../../lib/strapi'


export default function BannerImage({ media, alt = "" }) {
  const url =
    mediaURL(media) ||
    mediaURL(media?.image) ||   // si on te passe directement b (au cas où)
    mediaURL(media?.media) ||
    (typeof media === "string" ? media : null);
  return (
      <Image
        src={url}
        alt={alt || "banner"}
        width={1920}
        height={1080}
        priority
        className="mix-blend-darken w-full"
      />
  );
}
