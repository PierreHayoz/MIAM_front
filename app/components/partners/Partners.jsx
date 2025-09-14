// app/components/partners/PartnersStrip.jsx
import Image from "next/image";

const mediaUrl = (m) => {
  const url =
    m?.data?.attributes?.url ??
    m?.attributes?.url ??
    m?.url ?? null;
  if (!url) return null;
  const base = process.env.NEXT_PUBLIC_STRAPI_URL?.replace(/\/$/, "") || "";    
  return url.startsWith("http") ? url : `${base}${url}`;
};

export default function PartnersStrip({ items = [], className = "" }) {
  const list = Array.isArray(items?.data) ? items.data : Array.isArray(items) ? items : [];

  if (!list.length) return null;

  return (
    <section className={["", className].join(" ")}>

      <div className="md:grid-cols-2 grid-cols-1 lg:grid-cols-3 grid gap-4">
        {list.map((entry) => {
          const a = entry?.attributes ?? entry;
          const id = entry?.id ?? entry?.documentId;
          const name = a?.name ?? a?.nom ?? a?.title ?? "—";
          const url = a?.url ?? a?.link ?? null;
          const logo = mediaUrl(a?.logo ?? a?.image ?? a?.photo);
          const Logo = logo && 
            <Image
              src={logo}
              alt={name}
              width={80}
              height={80}
              className="object-contain w-full opacity-90 h-full hover:opacity-100 transition py-8"
            />
          
          return (
            <div key={`partner-${id}`} className="cursor-pointer bg-MIAMlightgrey hover:bg-MIAMgrey rounded-md p-8 h-40 flex items-center justify-center">
              {url && 
                <a href={url} target="_blank" rel="noopener noreferrer" title={name} className="w-full">
                  {Logo}
                </a>
               }
            </div>
          );
        })}
      </div>
    </section>
  );
}
