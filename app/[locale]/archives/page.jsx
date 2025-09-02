import RevealList from "@/app/components/reveal/RevealList";
import { getEvents } from "@/app/lib/strapi";
import { Suspense } from "react";                // 👈
export const revalidate = 3600; // 1h


export async function generateMetadata({ params: { locale } }) {
  // construit le pathname de la page courante
  const pathname = `/${locale}/archives`;
  try {
    const languages = await resolveAlternates(pathname);
    return {
      alternates: {
        languages, // <- format attendu par Next Metadata
      },
    };
  } catch {
    // fallback safe pour ne jamais casser le build
    return {};
  }
}
// Helpers -------------------------------------------------
const TZ = "Europe/Zurich";
const fmt = new Intl.DateTimeFormat("fr-CH", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: TZ,
});
const toYMD = (d) =>
  new Intl.DateTimeFormat("sv-SE", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d); // "YYYY-MM-DD" triable

const todayYMD = () => toYMD(new Date());

/** Compare des dates "YYYY-MM-DD" (chaînes) de façon sûre */
const isBefore = (ymdA, ymdB) => String(ymdA) < String(ymdB);

/** Retourne "01 sept. 2025 → 02 sept. 2025" (ou une seule date si identiques) */
function formatEventDateRange(e) {
  if (!e?.startDate && !e?.endDate) return "Sans date";
  const s = e.startDate ? fmt.format(new Date(e.startDate)) : null;
  const endRaw = e.endDate || e.startDate;
  const en = endRaw ? fmt.format(new Date(endRaw)) : null;
  if (s && en && s !== en) return `${s} → ${en}`;
  return s || en || "";
}

/** Retourne l'année (string) à partir d'endDate sinon startDate, sinon "Sans date" */
function yearOf(e) {
  const d = e?.endDate || e?.startDate;
  if (!d) return "Sans date";
  return String(d).slice(0, 4);
}

/** Sépare passés / futurs (comparaison en timezone Zurich) */
function splitByTime(events) {
  const today = todayYMD();
  const past = [];
  const upcoming = [];
  for (const e of events) {
    const end = e.endDate || e.startDate; // "YYYY-MM-DD"
    if (!end) {
      // à toi de voir : on peut mettre les "sans date" côté past ou upcoming ; ici on les met en past
      past.push(e);
    } else {
      isBefore(end, today) ? past.push(e) : upcoming.push(e);
    }
  }
  return { past, upcoming };
}

function groupByYear(list) {
  const out = {};
  for (const e of list) {
    const y = yearOf(e);
    (out[y] ||= []).push(e);
  }
  return out;
}

const eventKey = (e) => e.id ?? e.slug ?? Math.random().toString(36).slice(2);
const eventHref = (e, locale) => `/${locale || "fr"}/events/${e.slug}`;
const eventThumb = (e) => e.thumbnail || null;
const eventTags = (e) => Array.isArray(e.categories) ? e.categories : [];

// Page ----------------------------------------------------
export default async function Page({ params: { locale } }) {
  // Récupère tout (publié uniquement). Pour voir aussi les brouillons, passe preview: true (token requis)
  const events = await getEvents({ locale, preview: false, pageSize: 100 });

  const { past } = splitByTime(events);

  // tri dans chaque année (du plus récent au plus ancien), basé sur endDate puis startDate
  past.sort((a, b) => {
    const da = (a.endDate || a.startDate || "");
    const db = (b.endDate || b.startDate || "");
    return db.localeCompare(da);
  });

  const byYear = groupByYear(past);
  const keys = Object.keys(byYear);
  const years = keys
    .filter((y) => y !== "Sans date")
    .sort((a, b) => Number(b) - Number(a));
  if (keys.includes("Sans date")) years.push("Sans date");

  return (
    <section className="pt-24">
      <div className="grid grid-cols-4 px-4 gap-y-6 max-w-6xl mx-auto">
        <h2 className="text-3xl">Archives</h2>

        <div className="col-span-3 space-y-10">
          {years.map((year) => (
            <div key={year}>
              <h3 className="text-xl mb-2 opacity-70">{year}</h3>
              <Suspense fallback={null}>
                <RevealList
                  items={byYear[year]}
                  getKey={eventKey}
                  getHref={(e) => eventHref(e, locale)}
                  variant="image"
                  getThumbnail={eventThumb}
                  getTitle={(e) => {
                    const tags = eventTags(e);
                    return (
                      <div className="grid grid-cols-2 gap-2 items-start">
                        <div>
                          <div>{e.title}</div>
                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-1 text-xs text-MIAMgreytext">
                              {tags.map((t, i) => (
                                <span
                                  key={`${e.slug}-tag-${i}`}
                                  className="px-2 py-0.5 border border-MIAMgreytext/40 rounded-full"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right text-sm text-MIAMgreytext">
                          {formatEventDateRange(e)}
                        </div>
                      </div>
                    );
                  }}
                />
              </Suspense>
            </div>
          ))}

          {years.length === 0 && (
            <div className="text-sm opacity-70">
              Aucun événement passé pour le moment.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

