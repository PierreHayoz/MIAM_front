// app/components/cms/SectionCtaBlock.jsx
import Image from "next/image";
import Link from "next/link";
import RichTextServer from "@/app/components/ui/RichText";

const mediaURL = (u) =>
  u ? (u.startsWith("http") ? u : `${process.env.NEXT_PUBLIC_STRAPI_URL}${u}`) : null;

// helpers
const getAttrs = (x) => x?.attributes ?? x ?? {};
const getRelAttrs = (rel) => getAttrs(rel?.data ?? rel);

function routeForRelated(rel, locale = "fr") {
  const a = getRelAttrs(rel);
  const t = rel?.__type || rel?.__contentType || a?.__contentType || "";
  const slug = a?.slug;
  if (!slug) return `/${locale}`;
  switch (t) {
    case "api::page.page":
      return `/${locale}/${slug}`;
    case "api::event.event":
      return `/${locale}/events/${slug}`;
    default:
      return `/${locale}/${slug}`;
  }
}

function resolveLinkAny(linkLike, { locale = "fr" } = {}) {
  if (!linkLike) return null;
  const a = getAttrs(linkLike);

  // 1) relations internes (si tu ajoutes ça côté Strapi)
  if (a.page) return { href: routeForRelated(a.page, locale), label: a.label, external: false, newTab: false };
  if (a.event) return { href: routeForRelated(a.event, locale), label: a.label, external: false, newTab: false };

  // 2) URL directe
  if (a.url) {
    const href = a.url;
    const external = a.isExternal === true || /^https?:\/\//i.test(href);
    const newTab = a.openInNewTab === true || external;
    return { href, label: a.label, external, newTab };
  }

  // 3) (optionnel) fallback statique si tu veux éviter un CTA vide
  // return { href: `/${locale}/association`, label: a.label || "En savoir plus", external: false, newTab: false };

  return null;
}

export default function SectionCtaBlock({ block, locale = "fr" }) {
  if (!block) return null;
  const a = getAttrs(block);

  const title = a.title ?? a.titre ?? a.heading ?? null;
  const paragraph = a.paragraphe ?? a.paragraph ?? a.text ?? a.content ?? null;

  const img = mediaURL(
    a?.image?.url ??
    a?.image?.data?.attributes?.url ??
    a?.image?.data?.url ??
    a?.media?.url ??
    a?.media?.data?.attributes?.url ??
    null
  );
  // 🔥 utilise button (et garde link si un jour tu renommes)
  const link = resolveLinkAny(a.link ?? a.button, { locale });

  // Option de mise en page si tu veux utiliser image_left fourni par Strapi
  const imageLeft = a.image_left === true;
  const txtCol = "flex flex-col col-span-4 md:col-span-1 justify-between";
  const imgCol = "col-span-4 md:col-span-3";
  return (
    <section className="p-4 grid grid-cols-4 gap-4 py-16">
      {img && (
        <div className={`col-span-4 md:col-span-3 ${a.image_left && 'md:order-1'}`}>
          <Image
            src={img}
            width={800}
            height={800}
            alt={a.image.caption}
            className={`${imgCol} object-cover w-full  order-1`}
          />
          <div className="text-xs w-full text-center">{a.image.caption}</div>
        </div>
      )}

      <div className={txtCol}>
        {typeof paragraph === "string" ? (
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: paragraph }} />
        ) : paragraph ? (
          <RichTextServer value={paragraph} />
        ) : null}

        {link?.href && (
          link.external ? (
            <a
              href={link.href}
              target={link.newTab ? "_blank" : undefined}
              rel={link.newTab ? "noopener noreferrer" : undefined}
              className="mt-3 bg-MIAMblack rounded-full px-3 py-1 text-MIAMwhite w-fit"
            >
              {link.label || "En savoir plus"}
            </a>
          ) : (
            <Link
              href={link.href}
              className="inline-block px-4 py-2 rounded-xs border border-MIAMblack text-MIAMblack w-fit hover:bg-MIAMblack hover:text-white transition-colors"
            >
              {link.label || "En savoir plus"}
            </Link>
          )
        )}

      </div>
    </section>
  );
}
