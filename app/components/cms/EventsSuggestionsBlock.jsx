// app/components/cms/EventsSuggestionsBlock.jsx
import Card from "@/app/components/cards/Card";
import { getUpcomingEvents } from "@/app/lib/strapi";
import RichTextServer from "@/app/components/ui/RichText";


export default async function EventsSuggestionsBlock({
  items,                 // <- optionnel : si fourni, pas de fetch
  block = {},            // { intro|text, limit, ... } depuis Strapi
  locale = "fr",
  current,               // { documentId, slug, categories? } (l'event courant)
}) {
  const intro = block?.intro || block?.text || null;
  const limitFromBlock = Number(block?.limit);
  const limit = Number.isFinite(limitFromBlock) ? limitFromBlock : (Array.isArray(items) ? items.length : 3);

  const excludeDocumentId = current?.documentId ?? undefined;
  const excludeSlug = current?.slug ?? undefined;
  const currentCats = Array.isArray(current?.categories) ? current.categories : undefined;

  let list = Array.isArray(items) ? items : null;

  // Fetch uniquement si pas d'items fournis
  if (!list) {
    const overfetch = Math.max(limit, 1) + 5; // marge
    const suggestions = await getUpcomingEvents({
      locale,
      limit: overfetch,
      excludeDocumentId,
      excludeSlug,
      categories: currentCats,
    });
    list = suggestions || [];
  }

  // Ceinture + bretelles : filtre final déterministe
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
    <section className="">
      {intro ? (
        <div className="prose prose-sm text-MIAMgreytext mb-4">
          {typeof intro === "string" ? (
            <div dangerouslySetInnerHTML={{ __html: intro }} />
          ) : (
            <RichTextServer value={intro} />
          )}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {filtered.map((s, i) => (
          <Card
            key={`${s.documentId || s.id}-${s.slug}`} // clé stable
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
            descriptionBlocks={s.descriptionBlocks}
            contentBlocks={s.contentBlocks}
            categories={Array.isArray(s.categories) ? s.categories : []}
          />
        ))}
      </div>
    </section>
  );
}
