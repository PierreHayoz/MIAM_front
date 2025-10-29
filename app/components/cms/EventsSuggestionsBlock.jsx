// app/components/cms/EventsSuggestionsBlock.jsx
import Card from "@/app/components/cards/Card";
import { getUpcomingEvents } from "@/app/lib/strapi";
import { formatEventDateRange, formatDoorToEndRange } from "@/app/lib/events-utils";
import RichTextServer from "@/app/components/ui/RichText";

export default async function EventsSuggestionsBlock({
  items,
  block = {},
  locale = "fr",
  current,
}) {
  const intro = block?.intro || block?.text || null;
  const limitFromBlock = Number(block?.limit);
  const limit = Number.isFinite(limitFromBlock)
    ? limitFromBlock
    : (Array.isArray(items) ? items.length : 3);

  const excludeDocumentId = current?.documentId ?? undefined;
  const excludeSlug = current?.slug ?? undefined;
  const currentCats = Array.isArray(current?.categories) ? current.categories : undefined;

  let list = Array.isArray(items) ? items : null;

  if (!list) {
    const overfetch = Math.max(limit, 1) + 5;
    const suggestions = await getUpcomingEvents({
      locale,
      limit: overfetch,
      excludeDocumentId,
      excludeSlug,
      categories: currentCats,
    });
    list = suggestions || [];
  }

  const filtered = list
    .filter(
      (s) =>
        s &&
        s.slug !== excludeSlug &&
        (excludeDocumentId ? s.documentId !== excludeDocumentId : true)
    )
    .slice(0, limit);

  if (!filtered.length) return null;

  return (
    <section>
      {intro ? (
        <div className="prose prose-sm text-MIAMgreytext mb-4">
          {typeof intro === "string" ? (
            <div dangerouslySetInnerHTML={{ __html: intro }} />
          ) : (
            <RichTextServer value={intro} />
          )}
        </div>
      ) : null}

      {/* Masonry comme CardsList */}
      <div className="columns-1 sm:columns-2 lg:columns-3  gap-0">
      {filtered.map((s, i) => {
          const dateLabel = formatEventDateRange(s, locale);      // ✅ même format que la page event
          const timeLabel = formatDoorToEndRange(s, locale);      // ✅ "porte → fin" si dispo
          const occKey = `${s.id || s.documentId || s.slug}|${s.startDate || "no-date"}`;
          return (
          <div key={`${s.documentId || s.id}-${s.slug}`} className="break-inside-avoid mb-4">
            <Card
              index={i}
              locale={locale}
              slug={s.slug}
              title={s.title}
              thumbnail={s.thumbnail}
              startDate={s.startDate}
              endDate={s.endDate}
              startTime={s.startTime}
              endTime={s.endTime}
              description={s.description}
              doorOpening={s.doorOpening}
              descriptionBlocks={s.descriptionBlocks}
              contentBlocks={s.contentBlocks}
              categories={Array.isArray(s.categories) ? s.categories : []}
              dateLabel={dateLabel}               
              timeLabel={timeLabel}              
              __occKey={occKey}  
            />
          </div>
                 );
              })}
      </div>
    </section>
  );
}
