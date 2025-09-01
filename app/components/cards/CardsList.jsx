import FiltersClient from '../filters/FiltersClient'
import Card from './Card'

function normalize(s = '') {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}
const d0 = (s) => new Date(`${s}T00:00:00`)
const d1 = (s) => new Date(`${s}T23:59:59`)
const startOfWeek = (d = new Date()) => {
  const x = new Date(d); const day = (x.getDay() + 6) % 7
  x.setDate(x.getDate() - day); x.setHours(0, 0, 0, 0); return x
}
const endOfWeek = (d = new Date()) => { const s = startOfWeek(d); const e = new Date(s); e.setDate(s.getDate() + 6); e.setHours(23, 59, 59, 999); return e }
const startOfMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), 1)
const endOfMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
const startOfYear = (d = new Date()) => new Date(d.getFullYear(), 0, 1)
const endOfYear = (d = new Date()) => new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999)
const range = (t) => t === 'week' ? [startOfWeek(), endOfWeek()]
  : t === 'month' ? [startOfMonth(), endOfMonth()]
    : t === 'year' ? [startOfYear(), endOfYear()]
      : [null, null]

export default function CardsListServer({
  events,
  searchParams,
  locale, showFilters = true,
}) {
  const q = (searchParams?.q ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const rawCats = searchParams?.cat ?? [];
  const cats = Array.isArray(rawCats) ? rawCats : [rawCats].filter(Boolean);
  const [rs, re] = range(searchParams?.t);

  const allCats = Array.from(
    new Set(events.flatMap(e => e.categories ?? [])),
  ).sort((a, b) => a.localeCompare(b))

  const filtered = events.filter(e => {
    const hay = normalize(
      [e.title, e.description, e.content, (e.categories ?? []).join(' ')].filter(Boolean).join(' ')
    )
    const matchQ = !q || hay.includes(q)
    const matchCat = cats.length === 0 || (e.categories ?? []).some(c => cats.includes(c))
    const matchTime = !rs || !re || (d1(e.endDate ?? e.startDate) >= rs && d0(e.startDate) <= re)
    return matchQ && matchCat && matchTime
  })

  return (
    <div className="grid grid-cols-4 w-full">
      <aside className="col-span-4 md:col-span-1">
        <div className=" sticky top-8  ">
          {showFilters ? <FiltersClient allCats={allCats} /> : null}
        </div>
      </aside>

      <main className="col-span-4 md:col-span-3">
        <p className="text-sm text-MIAMgrey mb-4">
          {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
        </p>
        {filtered.length === 0 ? (
          <div className="text-MIAMgrey py-16 text-center">
            Aucun événement ne correspond à votre recherche.
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-0">
            {filtered.map((e, i) => (
              <div key={e.id} className="break-inside-avoid ">
                <Card {...e} locale={locale} index={i} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
