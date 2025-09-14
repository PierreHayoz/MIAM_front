// app/[locale]/events/[slug]/page.jsx
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { getEventBySlug, getGlobal, getUpcomingEvents } from "@/app/lib/strapi";
import { formatEventDateRange, eventThumb } from "@/app/lib/events-utils";
import CategoryPills from "@/app/components/ui/CategoryPills";
import GalleryMedia from "@/app/components/cms/GalleryMedia";
import EventsSuggestionsBlock from "@/app/components/cms/EventsSuggestionsBlock";
import RichText from "@/app/components/ui/RichText";
import PriceList from "@/app/components/ui/PriceList";

export const revalidate = 0;

function ctaLabel(locale, isReservation) {
  const lang = (locale || "fr").toLowerCase().split("-")[0];
  if (isReservation) {
    switch (lang) {
      case "fr": return "Réserver une place";
      case "en": return "Reserve a seat";
      case "de": return "Platz reservieren";
      default: return "Reserve a seat";
    }
  } else {
    switch (lang) {
      case "fr": return "Acheter un billet";
      case "en": return "Buy tickets";
      case "de": return "Tickets kaufen";
      default: return "Buy tickets";
    }
  }
}


function doorOpeningLabel(locale) {
  const lang = (locale || "fr").toLowerCase().split("-")[0]; // "fr-CH" -> "fr"
  switch (lang) {
    case "fr": return "Ouverture des portes";
    case "en": return "Doors opening";
    case "de": return "Türöffnung";
    default: return "Doors opening"; // fallback
  }
}
function formatTimeRange(e) {
  const { startTime, endTime } = e || {};
  if (!startTime && !endTime) return null;
  if (startTime && endTime) return `${startTime} – ${endTime}`;
  return startTime || endTime || null;
}

function formatDoorOpeningDisplay(door, locale) {
  if (!door) return null;
  if (door.time) return door.time; // cas le plus fréquent
  if (door.iso) {
    try {
      return new Date(door.iso).toLocaleTimeString(
        locale === "fr" ? "fr-CH" : locale,
        { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich" }
      );
    } catch { }
  }
  // si on a une date seule, on ne l’affiche pas en temps (trop ambigu)
  return null;
}


export default async function EventPage(props) {
  const { params, searchParams } = props
  const { locale, slug } = await params           // ✅ on attend params
  const sp = await searchParams
  const onParam = Array.isArray(sp?.on) ? sp.on[0] : sp?.on;

  const e = await getEventBySlug(slug, { locale });
  console.log(e)
  if (!e) return notFound();

  // — Global config (traduisible) —
  const global = await getGlobal({ locale });
  const globalBlocks = Array.isArray(global?.blocks) ? global.blocks : [];
  const sug = globalBlocks.find(
    (b) => (b.__component || b.component || b.type) === "shared.events-suggestions"
  );

  // — Suggestions dynamiques —
  const limit = Number(sug?.limit ?? 3);
  const exclude = sug?.excludeCurrent === true;

  // sur-fetch pour avoir de la marge après filtre client
  const overfetch = Math.max(limit, 1) + 5;

  const rawSuggestions = sug
    ? await getUpcomingEvents({
      locale,
      limit: overfetch,
      categories: Array.isArray(e.categories) ? e.categories : [],
      // on exclut systématiquement par id côté requête
      excludeId: e.id,
      // et on honore le toggle pour slug/documentId
      excludeDocumentId: exclude ? e.documentId : undefined,
      excludeSlug: exclude ? e.slug : undefined,
    })
    : [];

  // CEINTURE + BRETELLES : filtre client contre toute régression serveur
  const suggestions = rawSuggestions
    .filter(
      (x) =>
        x &&
        x.id !== e.id &&
        x.slug !== e.slug &&
        (!x.documentId || !e.documentId || x.documentId !== e.documentId)
    )
    .slice(0, limit);

  const selectedDate =
    +    typeof onParam === "string" ? onParam.slice(0, 10) : null;

  // occurrence correspondante
  const occ = selectedDate
    ? (Array.isArray(e.occurrences) ? e.occurrences.find(o => o.date === selectedDate) : null)
    : null;

  // vue projetée pour l’affichage
  const evView = occ ? {
    ...e,
    startDate: occ.date,
    endDate: occ.date,
    startTime: occ.startTime ?? e.startTime ?? null,
    endTime: occ.endTime ?? e.endTime ?? null,
  } : e;

  const timeRange = formatTimeRange(evView);
  const doorOpeningDisplay = formatDoorOpeningDisplay(e.doorOpening, locale);
  return (
    <article className="px-4">
      <div className="grid grid-cols-4 gap-2">
        <header className="col-span-4 md:col-span-2 ">
          <h1 className="text-3xl">{e.title}</h1>
          <p className="text-MIAMviolet bg-grey text-lg">
            {formatEventDateRange(evView)}
            {timeRange ? ` · ${timeRange}` : ""}
          </p>




          {/* 🔸 Alerte / warning */}

          <div className="py-2">
            {Array.isArray(e.categories) && e.categories.length > 0 && (
              <CategoryPills categories={e.categories} />
            )}
          </div>


          {Array.isArray(e.descriptionBlocks) && e.descriptionBlocks.length > 0 ? (
            <RichText value={e.descriptionBlocks} />
          ) : (
            e.description && <p className="text-lg whitespace-pre-line">{e.description}</p>
          )}


          {Array.isArray(e.content) && e.content.length > 0 ? (
            <div>
              <RichText value={e.content} />
            </div>
          ) : (
            e.content && <p className="">{e.content}</p>
          )}
          {e.warning && (
            <div
              className="mt-3 
                         text-MIAMtomato"
            >
              {e.warning}
            </div>
          )}
          {/* 🔸 Infos complémentaires */}
          {e.moreInfos && (
            <div className="mt-3 text-base whitespace-pre-line">
              {e.moreInfos}
            </div>
          )}
          {doorOpeningDisplay && (
            <p className="bg-black rounded-full text-white px-2 w-fit mt-4">
              {doorOpeningLabel(locale)}&nbsp;: {doorOpeningDisplay}
            </p>
          )}

         {e.ticketUrl && !e.isFree && (
  <div className="pt-2 items-center gap-2">
    {(e.isFree || (Array.isArray(e.prices) && e.prices.length) || e.price) && (
      <div className="mt-2 mb-4">
        <PriceList
          prices={e.prices}
          isFree={e.isFree}
          locale={locale === "fr" ? "fr-CH" : locale}
          defaultCurrency="CHF"
        />
      </div>
    )}

    <Link
      href={e.ticketUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block px-4 py-2 rounded-xs border border-MIAMblack text-MIAMblack hover:bg-MIAMblack hover:text-white transition-colors"
    >
      {ctaLabel(locale, e.isReservation)}
    </Link>
  </div>
)}

        </header>

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

      {Array.isArray(e.gallery) && e.gallery.length > 0 && (
        <section className="">
          <GalleryMedia items={e.gallery} />
        </section>
      )}

      {sug && (
        <section className="mt-12">
          {sug.title && <h2 className="text-2xl mb-4">{sug.title}</h2>}
          {suggestions?.length ? (
            <EventsSuggestionsBlock items={suggestions} locale={locale} />
          ) : (
            <p className="text-sm text-MIAMgreytext">Aucun événement suggéré</p>
          )}
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
