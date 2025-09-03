// app/[locale]/events/[slug]/page.jsx
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { getEventBySlug, getEventByDocument, getUpcomingEvents } from "@/app/lib/strapi";
import { formatEventDateRange, eventThumb } from "@/app/lib/events-utils";
import CategoryPills from "@/app/components/ui/CategoryPills";
import GalleryMedia from "@/app/components/cms/GalleryMedia";
import RichText from "@/app/components/ui/RichText";
import Card from "@/app/components/cards/Card";
import ShareButtons from "@/app/components/ui/ShareButton";

export const revalidate = 0;



function formatTimeRange(e) {
    const { startTime, endTime } = e || {};
    if (!startTime && !endTime) return null;
    if (startTime && endTime) return `${startTime}–${endTime}`;
    return startTime || endTime || null;
}

export default async function EventPage({ params }) {
    const { locale, slug } = await params;

    // récupère l'event dans la bonne langue
    const e = await getEventBySlug(slug, { locale });
    if (!e) return notFound();

    const site = process.env.NEXT_PUBLIC_SITE_URL || "https://miam.tipper.watch";
    const shareUrl = `${site}/${locale}/events/${e.slug}`;
    const timeRange = formatTimeRange(e);

    // ✨ SUGGESTIONS : 3 prochains
    const suggestions = await getUpcomingEvents({
        locale,
        limit: 3,
        excludeDocumentId: e.documentId,        // évite la même fiche (autres locales)
        excludeSlug: e.slug,                     // ceinture + bretelles
        categories: Array.isArray(e.categories) ? e.categories : [],
    });

    return (
        <article className="px-4">
            <div className="grid grid-cols-4 gap-2">
                {/* HEADER / INFOS */}
                <header className="col-span-4 md:col-span-2 space-y-3">
                    <h1 className="text-3xl">{e.title}</h1>

                    <p className="text-MIAMgreytext">
                        {formatEventDateRange(e)}
                        {timeRange ? ` · ${timeRange}` : ""}
                    </p>

                    {Array.isArray(e.categories) && e.categories.length > 0 && (
                        <CategoryPills categories={e.categories} />
                    )}

                    {e.isKidsFriendly === false && (
                        <div className="mt-2 text-xs px-3 py-2 rounded border border-red-500 text-red-600">
                            ⚠️ Cet événement n’est pas recommandé pour les enfants.
                        </div>
                    )}
                    
{/* <ShareButtons
  title={e.title}
  description={e.description}
  url={shareUrl}           // 👈 absolue
  utm={{ source: "share", medium: "page" }}
  className="mb-4"
/> */}
                    {/* Description / contenu (rich text si dispo) */}
                    {Array.isArray(e.descriptionBlocks) && e.descriptionBlocks.length > 0 ? (
                        <div className="text-lg">
                            <RichText value={e.descriptionBlocks} />
                        </div>
                    ) : (
                        e.description && (
                            <p className="text-lg whitespace-pre-line">{e.description}</p>
                        )
                    )}

                    {Array.isArray(e.contentBlocks) && e.contentBlocks.length > 0 ? (
                        <div className="text-sm text-MIAMgreytext">
                            <RichText value={e.contentBlocks} />
                        </div>
                    ) : (
                        e.content && (
                            <p className="text-sm text-MIAMgreytext whitespace-pre-line">
                                {e.content}
                            </p>
                        )
                    )}

                    {/* CTA billets */}
                    {e.ticketUrl && !e.isFree && (
                        <div className="pt-2 flex items-center gap-2">
                            <div className="text-lg text-MIAMwhite bg-MIAMviolet rounded-full h-full flex items-center px-2 py-1">
                                {e.isFree ? "Gratuit" : e.price || "Tarif à venir"}
                            </div>
                            <Link
                                href={e.ticketUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-4 py-2 rounded-xs border border-MIAMblack text-MIAMblack hover:bg-MIAMblack hover:text-white transition-colors"
                            >
                                Acheter des billets
                            </Link>

                        </div>
                    )}
                </header>

                {/* IMAGE PRINCIPALE */}
                <div className="col-span-4 md:col-span-2 md:pl-4">
                    {eventThumb(e) && (
                        <Image
                            width={1080}
                            height={800}
                            src={eventThumb(e)}
                            alt={e.title || ""}
                            className="w-full h-auto rounded-xs mix-blend-darken"
                            priority
                        />
                    )}
                </div>
            </div>

            {/* GALERIE */}
            {Array.isArray(e.gallery) && e.gallery.length > 0 && (
                <section className="grid grid-cols-2 mt-8 gap-4">
                    <GalleryMedia items={e.gallery} />
                </section>
            )}


            {Array.isArray(suggestions) && suggestions.length > 0 && (
                <section className="mt-24 pb-24">
                    <h2 className="text-lg mb-4">Autres événements au programme</h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        {suggestions.map((s, i) => (
                            <Card
                                key={`${s.documentId || s.id}-${s.slug}`}
                                index={i}
                                locale={locale}
                                slug={s.slug}
                                title={s.title}
                                thumbnail={s.thumbnail}          // ou eventThumb(s) si tu préfères sa logique
                                startDate={s.startDate}
                                endDate={s.endDate}
                                startTime={s.startTime}
                                endTime={s.endTime}
                                description={s.description}
                                descriptionBlocks={s.descriptionBlocks}
                                contentBlocks={s.contentBlocks}
                                categories={s.categories}        // ta mapEvent retourne des NOMS
                            />
                        ))}
                    </div>
                </section>
            )}
        </article>
    );
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const e = await getEventBySlug(slug, { locale });
  if (!e) return {};

  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://miam.tipper.watch";
  const url = `${site}/${locale}/events/${e.slug}`;
  const shareUrl = `${site}/${locale}/events/${e.slug}`;
  const title = e.title;
  const description = e.description?.slice(0, 150) || "";
  const image = e.thumbnail || `${site}/og-default.jpg`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "MIAM",
      locale,
      type: "article",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

