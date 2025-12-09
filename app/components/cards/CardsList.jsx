// app/components/cards/CardsList.jsx
import FiltersClient from '../filters/FiltersClient';
import Card from './Card';
import { formatEventDateRange, formatDoorToEndRange } from "@/app/lib/events-utils";

// ---------- helpers ----------
function normalize(s = '') {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}
const d0 = (s) => new Date(`${s}T00:00:00`);
const d1 = (s) => new Date(`${s}T23:59:59`);

const startOfWeek = (d = new Date()) => {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // lundi=0
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
};
const endOfWeek = (d = new Date()) => {
  const s = startOfWeek(d);
  const e = new Date(s);
  e.setDate(s.getDate() + 6);
  e.setHours(23, 59, 59, 999);
  return e;
};
const startOfMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
const startOfYear = (d = new Date()) => new Date(d.getFullYear(), 0, 1);
const endOfYear = (d = new Date()) => new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);

function range(t) {
  if (!t) return [null, null];

  if (t === 'week') return [startOfWeek(), endOfWeek()];
  if (t === 'month') return [startOfMonth(), endOfMonth()];
  if (t === 'year') return [startOfYear(), endOfYear()];

  // 🔥 t = "2025", "2026", etc. → filtre sur l'année
  if (/^\d{4}$/.test(String(t))) {
    const year = Number(t);
    const d = new Date(year, 0, 1);
    return [startOfYear(d), endOfYear(d)];
  }

  return [null, null];
}

// Aplatis : 1 instance par occurrence ; s'il n'y a pas d'occurrence on garde la date de base
function buildInstances(events, locale) {
  const out = [];
  for (const e of events) {
    const occ = Array.isArray(e.occurrences) ? e.occurrences.filter(o => o?.date) : [];
    const rangeLabel = formatEventDateRange(e, locale);
    if (occ.length === 0) {
      const inst = {
        ...e,
        __occKey: `${e.id}|${e.startDate || 'no-date'}`,
      };
      const timeLabel = formatDoorToEndRange(inst, locale);
      out.push({ ...inst, __dateLabel: rangeLabel, __timeLabel: timeLabel });
      continue;
    }
    for (const o of occ) {
      const inst = {
        ...e,
        startDate: o.date,
        endDate: o.date,
        startTime: o.startTime ?? e.startTime,
        endTime: o.endTime ?? e.endTime,
        __occKey: `${e.id}|${o.date}|${o.startTime ?? ''}`,
      };
      const timeLabel = formatDoorToEndRange(inst, locale);
      out.push({ ...inst, __dateLabel: rangeLabel, __timeLabel: timeLabel });
    }
  }
  return out;
}

// Filtre temps : par défaut on teste la date de l'instance (occurrence)
function matchTime(instance, rs, re) {
  if (!rs || !re) return true;
  const start = instance.startDate ? d0(instance.startDate) : null;
  const end = instance.endDate ? d1(instance.endDate) : start;
  if (start && end) return end >= rs && start <= re;
  return false;
}

// 🔥 Années disponibles à partir des instances
function extractYears(instances) {
  const set = new Set();
  for (const e of instances) {
    const d = e.startDate || e.endDate;
    if (!d) continue;
    const y = String(d).slice(0, 4);
    if (/^\d{4}$/.test(y)) set.add(y);
  }
  // 2025, 2024, 2023...
  return Array.from(set).sort((a, b) => b.localeCompare(a));
}

// ---------- component ----------
export default function CardsListServer({
  events,
  searchParams,
  locale,
  showFilters = true,
  mode = 'default',      // "default" = programme, "archive" = archives
  fixedCats = [],        // 👈 catégories forcées (venant du bloc)
}) {

    const q = normalize(searchParams?.q ?? '');
  const rawCats = searchParams?.cat ?? [];
  const cats = Array.isArray(rawCats) ? rawCats : [rawCats].filter(Boolean);
  const [rs, re] = range(searchParams?.t);

  // catégories présentes dans les events
  const catsFromEvents = Array.from(new Set(events.flatMap(e => e.categories ?? [])))
    .sort((a, b) => a.localeCompare(b));

  // 🔥 fusion : catégories du bloc + catégories présentes dans les events
  const allCats = Array.from(
    new Set([...(fixedCats || []), ...catsFromEvents])
  ).sort((a, b) => a.localeCompare(b));


  // 1) aplatir en instances
  const instances = buildInstances(events, locale)
    .sort((a, b) => (a.startDate || '9999-12-31').localeCompare(b.startDate || '9999-12-31'));

  // 🔥 années pour le mode archive
  const yearOptions = mode === 'archive' ? extractYears(instances) : [];

  // 2) filtrage sur les instances
  const filtered = instances.filter(e => {
    const hay = normalize(
      [e.title, e.description, e.content, (e.categories ?? []).join(' ')]
        .filter(Boolean)
        .join(' ')
    );
    const matchQ = !q || hay.includes(q);
    const matchCat = cats.length === 0 || (e.categories ?? []).some(c => cats.includes(c));
    const matchT = matchTime(e, rs, re);
    return matchQ && matchCat && matchT;
  });

  return (
    <div className="grid grid-cols-4 w-full">
      <aside className="col-span-4 md:col-span-1 md:sticky md:top-0">
        <div className="md:sticky md:top-24">
          {showFilters ? (
            <FiltersClient
              locale={locale}
              allCats={allCats}
              mode={mode}           // 👈 on passe le mode
              years={yearOptions}    // 👈 et les années (archives)
            />
          ) : null}
        </div>
      </aside>

      <main className="col-span-4 md:col-span-3 md:px-4">
        {filtered.length === 0 ? (
          <div className="text-MIAMgrey py-16 text-center">
            Aucun événement ne correspond à votre recherche.
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-0">
            {filtered.map((e, i) => (
              <div key={e.__occKey} className="break-inside-avoid">
                <Card
                  {...e}
                  locale={locale}
                  index={i}
                  dateLabel={e.__dateLabel}
                  timeLabel={e.__timeLabel}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
