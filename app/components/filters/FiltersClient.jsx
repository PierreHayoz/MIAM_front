'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

export default function FiltersClient({ allCats = [] }) {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // état local pour la barre de recherche (debounced)
  const [q, setQ] = useState(sp.get('q') ?? '')

  const time = sp.get('t') || ''
  const activeCats = useMemo(() => new Set(sp.getAll('cat')), [sp])

  function commit(params, { replace = false } = {}) {
    const url = params.toString() ? `${pathname}?${params.toString()}` : pathname
    startTransition(() => {
      // rem: push = garde l'historique, replace = ne pollue pas l'historique
      (replace ? router.replace : router.push)(url, { scroll: false })
    })
  }

  function update(updater, opts) {
    const params = new URLSearchParams(sp.toString())
    updater(params)
    commit(params, opts)
  }

  // recherche: debounce (évite 1 nav par frappes)
  useEffect(() => {
    const id = setTimeout(() => {
      update((p) => {
        const v = q.trim()
        if (v) p.set('q', v)
        else p.delete('q')
      }, { replace: true }) // replace pour ne pas spammer l'historique
    }, 300)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const setTime = (k) => {
    update((p) => {
      if (!k) p.delete('t')
      else p.set('t', k)
    }, { /* push par défaut => clic = historique navigable */ })
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
    update((p) => {
      p.delete('q'); p.delete('t'); p.delete('cat')
    }, { replace: false })
    setQ('')
  }

  return (
    <div className="space-y-6 h-full">
      {/* Search */}
      <div className="bg-MIAMlightgrey rounded-full flex items-center gap-2 p-2 w-full">
        <Search aria-hidden className="ml-1" />
        <input
          type="search"
          className="pl-1 w-full bg-transparent outline-none text-sm"
          placeholder="Rechercher… "
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Escape') setQ('') }}
          aria-label="Rechercher"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ('')}
            className="bg-MIAMblack text-MIAMwhite hover:bg-MIAMgrey rounded-full p-1"
            aria-label="Effacer la recherche"
            title="Effacer"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Quand ? */}
      <div className=''>
        <h2 className="text-xl">Quand ?</h2>
        <div className="flex flex-wrap gap-2 pt-2 ">
          {[
            { k: '', label: 'Toutes les dates' },
            { k: 'week', label: 'Cette semaine' },
            { k: 'month', label: 'Ce mois-ci' },
            { k: 'year', label: 'Cette année' },
          ].map(opt => (
            <button
              key={opt.k || 'all'}
              type="button"
              onClick={() => setTime(opt.k)}
              className={
                'px-3 py-1 rounded-full   text-sm ' +
                ((time === (opt.k || '')) ? 'bg-MIAMblack  text-white cursor-pointer' : 'bg-MIAMlightgrey hover:bg-MIAMgrey duration-500 text-MIAMblack hover:text-black cursor-pointer')
              }
              aria-pressed={time === (opt.k || '')}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quoi ? */}
      <div className=''>
        <h2 className="text-xl">Quoi ?</h2>
        <ul className="flex flex-wrap gap-2 pt-2">
          {allCats.map((cat) => {
            const active = activeCats.has(cat)
            return (
              <li key={cat} className='cursor-pointer'>
                <button
                  type="button"
                  onClick={() => toggleCat(cat)}
                  className={
                    'px-3 py-1 rounded-full text-sm ' +
                    (active ? 'bg-MIAMblack text-white cursor-pointer'
                            : 'bg-MIAMlightgrey  text-MIAMblack hover:text-black cursor-pointer' )
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
        <button onClick={reset} type="button" className="text-sm underline text-MIAMgrey hover:text-black">
          Réinitialiser les filtres
        </button>
      </div>

      {isPending && <div className="text-xs text-MIAMgrey">Mise à jour…</div>}
    </div>
  )
}
