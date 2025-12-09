'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams, useParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

// ---- i18n ultra-light
const UI = {
  fr: {
    searchPh: 'Rechercher…',
    searchAria: 'Rechercher',
    clearAria: 'Effacer la recherche',
    clearTitle: 'Effacer',
    when: 'Quand ?',
    allDates: 'Toutes les dates',
    thisWeek: 'Cette semaine',
    thisMonth: 'Ce mois-ci',
    thisYear: 'Cette année',
    what: 'Quoi ?',
    reset: 'Réinitialiser les filtres',
    updating: 'Mise à jour…',
    switchToArchive: 'Voir les archives',
    switchToProgramme: 'Voir le programme',
  },
  en: {
    searchPh: 'Search…',
    searchAria: 'Search',
    clearAria: 'Clear search',
    clearTitle: 'Clear',
    when: 'When?',
    allDates: 'All dates',
    thisWeek: 'This week',
    thisMonth: 'This month',
    thisYear: 'This year',
    what: 'What?',
    reset: 'Reset filters',
    updating: 'Updating…',
    switchToArchive: 'View archive',
    switchToProgramme: 'View programme',
  },
  de: {
    searchPh: 'Suchen…',
    searchAria: 'Suchen',
    clearAria: 'Suche löschen',
    clearTitle: 'Löschen',
    when: 'Wann?',
    allDates: 'Alle Termine',
    thisWeek: 'Diese Woche',
    thisMonth: 'Diesen Monat',
    thisYear: 'Dieses Jahr',
    what: 'Was?',
    reset: 'Filter zurücksetzen',
    updating: 'Aktualisiere…',
    switchToArchive: 'Archiv anzeigen',
    switchToProgramme: 'Programm anzeigen',
  },
}

const baseLang = (l) => String(l || 'fr').toLowerCase().split('-')[0]
const t = (l, k) => UI[baseLang(l)]?.[k] ?? UI.en[k] ?? k

export default function FiltersClient({
  allCats = [],
  locale: explicitLocale,
  mode = 'default',   // "default" = programme, "archive" = archives
  years = [],         // années dispo pour les archives
}) {

  const params = useParams()
  const locale = explicitLocale || params?.locale || 'fr'

  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const [isPending, startTransition] = useTransition()

    const yearOptions = useMemo(
    () => (Array.isArray(years) ? years : []),
    [years]
  );

  // URL cible pour basculer Programme ↔ Archives
  const altPath = useMemo(() => {
    if (!pathname) return null;
    const parts = pathname.split('/').filter(Boolean); // ["fr", "programme"] par ex.
    if (parts.length === 0) return null;

    const next = [...parts];

    if (mode === 'archive') {
      const idx = next.indexOf('archives');
      if (idx === -1) return null;
      next[idx] = 'programme';
    } else {
      const idx = next.indexOf('programme');
      if (idx === -1) return null;
      next[idx] = 'archives';
    }

    return '/' + next.join('/');
  }, [pathname, mode]);

  // état local pour la barre de recherche (debounced)
  const [q, setQ] = useState(sp.get('q') ?? '')

  const time = sp.get('t') || ''
  const activeCats = useMemo(() => new Set(sp.getAll('cat')), [sp])


  function commit(params, { replace = false } = {}) {
    const url = params.toString() ? `${pathname}?${params.toString()}` : pathname
    startTransition(() => {
      (replace ? router.replace : router.push)(url, { scroll: false })
    })
  }

  function update(updater, opts) {
    const params = new URLSearchParams(sp.toString())
    updater(params)
    commit(params, opts)
  }

  // recherche: debounce (évite 1 nav par frappe)
  useEffect(() => {
    const id = setTimeout(() => {
      update((p) => {
        const v = q.trim()
        if (v) p.set('q', v)
        else p.delete('q')
      }, { replace: true })
    }, 300)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const setTime = (k) => {
    update((p) => {
      if (!k) p.delete('t')
      else p.set('t', k)
    })
  }

  const toggleCat = (cat) => {
    update((p) => {
      const next = new Set(p.getAll('cat'))
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      p.delete('cat')
      for (const c of next) p.append('cat', c)
    })
  }

  const reset = () => {
    update((p) => { p.delete('q'); p.delete('t'); p.delete('cat') }, { replace: false })
    setQ('')
  }

  return (
    <div className="">
      {altPath && (
        <div className="pb-8">
          <button
            type="button"
            onClick={() => router.push(altPath)}
            className="text-sm underline text-MIAMblack hover:text-MIAMgrey"
          >
            {mode === 'archive'
              ? t(locale, 'switchToProgramme')
              : t(locale, 'switchToArchive')}
          </button>
        </div>
      )}
    <div className="space-y-6 h-full">
      {/* Search */}
      
      <div className="bg-MIAMlightgrey rounded-full flex items-center gap-2 p-2 w-full">
        <Search aria-hidden className="ml-1" />
        <input
          type="search"
          className="pl-1 w-full bg-transparent outline-none text-sm"
          placeholder={t(locale, 'searchPh')}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Escape') setQ('') }}
          aria-label={t(locale, 'searchAria')}
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ('')}
            className="bg-MIAMblack text-MIAMwhite hover:bg-MIAMgrey rounded-full p-1"
            aria-label={t(locale, 'clearAria')}
            title={t(locale, 'clearTitle')}
          >
            <X size={16} />
          </button>
        )}
      </div>

           {/* Quand ? */}
      <div>
        <h2 className="text-xl">{t(locale, 'when')}</h2>
        <div className="flex flex-wrap gap-2 pt-2 ">
          {mode === 'archive'
            ? (
              // Mode ARCHIVES : Toutes les dates + années (2025, 2024, …)
              [
                { k: '', label: t(locale, 'allDates') },
                ...yearOptions.map((y) => ({ k: y, label: y })),
              ].map((opt) => (
                <button
                  key={opt.k || 'all'}
                  type="button"
                  onClick={() => setTime(opt.k)}
                  className={
                    'px-3 py-1 rounded-full text-sm ' +
                    ((time === (opt.k || ''))
                      ? 'bg-MIAMblack text-white cursor-pointer'
                      : 'bg-MIAMlightgrey hover:bg-MIAMgrey duration-500 text-MIAMblack hover:text-black cursor-pointer')
                  }
                  aria-pressed={time === (opt.k || '')}
                >
                  {opt.label}
                </button>
              ))
            )
            : (
              // Mode PROGRAMME : Toutes les dates / semaine / mois / année
              [
                { k: '',      label: t(locale, 'allDates') },
                { k: 'week',  label: t(locale, 'thisWeek') },
                { k: 'month', label: t(locale, 'thisMonth') },
                { k: 'year',  label: t(locale, 'thisYear') },
              ].map((opt) => (
                <button
                  key={opt.k || 'all'}
                  type="button"
                  onClick={() => setTime(opt.k)}
                  className={
                    'px-3 py-1 rounded-full text-sm ' +
                    ((time === (opt.k || ''))
                      ? 'bg-MIAMblack text-white cursor-pointer'
                      : 'bg-MIAMlightgrey hover:bg-MIAMgrey duration-500 text-MIAMblack hover:text-black cursor-pointer')
                  }
                  aria-pressed={time === (opt.k || '')}
                >
                  {opt.label}
                </button>
              ))
            )
          }
        </div>
      </div>



      {/* Quoi ? */}
      <div>
        <h2 className="text-xl">{t(locale, 'what')}</h2>
        <ul className="flex flex-wrap gap-2 pt-2">
          {allCats.map((cat) => {
            const active = activeCats.has(cat)
            return (
              <li key={cat} className="cursor-pointer">
                <button
                  type="button"
                  onClick={() => toggleCat(cat)}
                  className={
                    'px-3 py-1 rounded-full text-sm ' +
                    (active
                      ? 'bg-MIAMblack text-white cursor-pointer'
                      : 'bg-MIAMlightgrey text-MIAMblack hover:text-black cursor-pointer')
                  }
                  aria-pressed={active}
                >
                  {cat}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Reset */}
      <div>
        <button onClick={reset} type="button" className="pb-8 text-sm underline text-MIAMgrey hover:text-black">
          {t(locale, 'reset')}
        </button>
      </div>
      </div>
    </div>
  )
}
