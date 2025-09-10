// app/lib/blocks.js
import { getUpcomingEvents } from "@/app/lib/strapi";

export async function resolveUpcomingBlock(b, { locale = "fr" } = {}) {
  const a = b?.attributes ?? b ?? {};
  const title = a.title ?? "Prochains événements";
  const limit = Number(a.limit ?? 3);
  const excludeCurrent = false; // sur la Home on ne s’exclut de rien

  const items = await getUpcomingEvents({
    locale,
    limit,
    categories: [],                 // <- pas de filtre catégories
    excludeDocumentId: undefined,   // <- pas d’exclusion sur Home
    excludeSlug: undefined,
  });

  return { title, items };
}
