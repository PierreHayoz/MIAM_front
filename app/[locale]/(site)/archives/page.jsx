import ArchivesListClient from "@/app/components/reveal/ArchivesListClient";
import { formatEventDateRange, groupByYear, splitEventsByTime } from "@/app/lib/events-utils";
import { getEvents } from "@/app/lib/strapi";
export const revalidate = 3600;

export async function generateMetadata(props) {
  const { locale } = await props.params; // ✅
  const pathname = `/${locale}/archives`;
  try {
    const languages = await resolveAlternates(pathname);
    return { alternates: { languages } };
  } catch { return {}; }
}

export default async function Page(props) {
  const { locale } = await props.params; // ✅
  const events = await getEvents({ locale, preview: false, pageSize: 100 });

  const { past } = splitEventsByTime(events);
  past.sort((a, b) => (b.endDate || b.startDate || "").localeCompare(a.endDate || a.startDate || ""));

  const byYear = groupByYear(past);
  const keys = Object.keys(byYear);
  const years = keys.filter(y => y !== "Sans date").sort((a, b) => Number(b) - Number(a));
  if (keys.includes("Sans date")) years.push("Sans date");

  const groups = years.map(year => ({
    year,
    items: byYear[year].map(e => ({
      key: e.id ?? e.slug ?? Math.random().toString(36).slice(2),
      href: `/${locale || "fr"}/events/${e.slug}`,
      title: e.title,
      tags: Array.isArray(e.categories) ? e.categories : [],
      dateRange: formatEventDateRange(e),
      thumbnail: e.thumbnail || null,
    })),
  }));

  return (
    <section className="pt-24">
      <div className="grid grid-cols-4 px-4">
        <h2 className="text-3xl">Archives</h2>
        <div className="col-span-4 md:col-span-3 space-y-10">
          <ArchivesListClient groups={groups} />
          {years.length === 0 && (
            <div className="text-sm opacity-70">Aucun événement passé pour le moment.</div>
          )}
        </div>
      </div>
    </section>
  );
}
