export const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL;
export const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

function buildUrl(path, params = {}) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v != null && usp.append(k, String(v)));
  const sep = path.includes("?") ? "&" : "?";
  return `${STRAPI_URL}${path}${sep}${usp.toString()}`;
}

async function doFetch(path, { params = {}, next = { revalidate: 1800 } } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (STRAPI_TOKEN) headers.Authorization = `Bearer ${STRAPI_TOKEN}`;
  const url = buildUrl(path, params);
  const res = await fetch(url, { headers, next });
  if (!res.ok) {
    const text = await res.text();
    console.error("[strapiFetch]", res.status, url, text);
    throw new Error(`Strapi ${res.status}: ${text}`);
  }
  return res.json();
}

function normalizeEntry(entry) {
  if (!entry) return null;
  return entry.attributes ? { id: entry.id, ...entry.attributes } : entry;
}
// app/lib/strapi.js
// ...
export async function getPartners({
  locale = "fr",
  pageSize = 100,
  next = { revalidate: 300 },
} = {}) {
  const params = {
    ...(locale ? { locale } : {}),
    "pagination[pageSize]": String(pageSize),
    "populate[logo]": "true",
  };
  const data = await doFetch(`/api/partners`, { params, next });
  return (data?.data ?? []).map(normalizeEntry);
}

// app/lib/strapi.js
export async function getHomepage({ locale = "fr", preview = false, next = { revalidate: 0 } } = {}) {
  const params = {
    ...(preview ? { publicationState: "preview" } : {}),
    ...(locale ? { locale } : {}),
    "populate[blocks][on][shared.section-cta][populate][image]": "true",
    "populate[blocks][on][shared.section-cta][populate][button]": "true",
    "populate[blocks][on][shared.section-cta][populate][button][fields][0]": "label",
    "populate[blocks][on][shared.section-cta][populate][button][populate][page]": "true",

    "populate[blocks][on][blocks.mid-paragraph][populate]": "*",
    "populate[blocks][on][blocks.partners-list][populate][partners][populate][logo]": "true",
    "populate[blocks][on][shared.events-suggestions][populate]": "true",


  };

  const data = await doFetch(`/api/homepage`, { params, next });
  console.log(data)
  return data?.data?.attributes ? { id: data.data.id, ...data.data.attributes } : data?.data;
}


// app/lib/strapi.js
export async function getGlossaires({
  locale = "fr",
  pageSize = 200,
  next = { revalidate: 0 },
} = {}) {
  const params = {
    ...(locale ? { locale } : {}),
    "pagination[pageSize]": String(pageSize),
    "populate[image]": "true",
  };
  const data = await doFetch(`/api/glossaires`, { params, next });
  return (data?.data ?? []).map(normalizeEntry);
}

export async function getMembres({
  locale = "fr",
  pageSize = 200,
  next = { revalidate: 0 },
} = {}) {
  const params = {
    ...(locale ? { locale } : {}),
    "pagination[pageSize]": String(pageSize),
    "populate[photo]": "true",
  };
  const data = await doFetch(`/api/membres`, { params, next });
  return (data?.data ?? []).map(normalizeEntry);
}

// app/lib/strapi.js
export async function getPageBySlug(slug, { locale = "fr", preview = false } = {}) {
  const params = {
    ...(preview ? { publicationState: "preview" } : {}),
    "filters[slug][$eq]": slug,
    "locale": locale,
    "pagination[pageSize]": 1,
    "populate": "*",
    "populate[blocks][populate]": "*",
    "populate[blocks][on][blocks.events-list][populate]": "true",
    "populate[blocks][on][blocks.paragraphes][populate]": "*",
    "populate[blocks][on][blocks.membres][populate]": "*",
    "populate[blocks][on][blocks.glossaires][populate]": "true",
    "populate[blocks][on][blocks.banner][populate]": "*",
    "populate[blocks][on][blocks.paragraphes][populate]": "*",
    "populate[blocks][on][blocks.mid-paragraph][populate]": "*",
    "populate[blocks][on][blocks.gallery-media][populate][gallery][populate]": "*",
    "populate[blocks][on][blocks.paragraphes][populate]": "*",
    "populate[blocks][on][blocks.partners-list][populate][partners][populate][logo]": "true",

    "populate[blocks][populate][pageIntro]": "*",


  };

  const data = await doFetch(`/api/pages`, { params, next: { revalidate: 0 } });
  return normalizeEntry(data?.data?.[0]);

}
export async function getGlobal({
  locale = "fr",
  preview = false,
  next = { revalidate: 0 },
} = {}) {
  const params = {
    ...(preview ? { publicationState: "preview" } : {}),
    ...(locale ? { locale } : {}),

    // Peuple la DZ + cible le bloc events-suggestions et ses champs
    "populate[blocks][populate]": "true",
    "populate[blocks][on][shared.events-suggestions][fields][0]": "title",
    "populate[blocks][on][shared.events-suggestions][fields][1]": "limit",
    "populate[blocks][on][shared.events-suggestions][fields][2]": "excludeCurrent",
  };

  const data = await doFetch(`/api/global`, { params, next });
  return normalizeEntry(data?.data);
}


export async function getPageById(id, { locale = "fr", preview = false } = {}) {
  const params = {
    ...(preview ? { publicationState: "preview" } : {}),
    ...(locale ? { locale } : {}),
    "fields[0]": "slug",
    "fields[1]": "locale",
  };
  const data = await doFetch(`/api/pages/${id}`, { params, next: { revalidate: 0 } });
  return normalizeEntry(data?.data);
}
export async function getPageByDocument(documentId, { locale = "fr", preview = false } = {}) {
  const params = {
    ...(preview ? { publicationState: "preview" } : {}),
    ...(locale ? { locale } : {}),
    "filters[documentId][$eq]": documentId,
    "pagination[pageSize]": 1,
    "fields[0]": "slug",
    "fields[1]": "locale",
    "fields[2]": "documentId",
  };
  const data = await doFetch(`/api/pages`, { params, next: { revalidate: 0 } });
  return normalizeEntry(data?.data?.[0]);
}
function blocksToText(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(blocksToText).join(' ');
  if (typeof node === 'object') {
    if (Array.isArray(node.children)) return node.children.map(blocksToText).join(' ');
    if (typeof node.text === 'string') return node.text;
    return Object.values(node).map(blocksToText).join(' ');
  }
  return '';
}

function pickCategories(e) {
  const raw = e.event_categories ?? e.categories;
  if (raw?.data) return raw.data.map(c => c?.attributes?.name).filter(Boolean);
  if (Array.isArray(raw) && raw.every(v => typeof v === 'string')) return raw.filter(Boolean);
  if (Array.isArray(raw) && raw.length && typeof raw[0] === 'object') return raw.map(o => o?.name).filter(Boolean);
  return [];
}

export function mediaURL(input) {
  if (!input) return null;
  const raw =
    (typeof input === 'string' ? input : null) ||
    input.url ||
    input?.data?.attributes?.url ||
    input?.data?.url ||
    input?.attributes?.url;
  return raw ? (raw.startsWith('http') ? raw : `${STRAPI_URL}${raw}`) : null;
}


function toISODate(d) {
  if (!d) return null;
  const s = String(d);
  return s.length >= 10 ? s.slice(0, 10) : null; // "YYYY-MM-DD"
}
const trimTime = (t) => (t ? String(t).slice(0, 5) : null);

function mapEvent(entry) {
  // entrée Strapi v4/v5
  const e = entry?.attributes ? { id: entry.id, ...entry.attributes } : (entry || {});
  const coverUrl =
    e.cover?.data?.attributes?.url ??
    e.cover?.url ??
    null;

  // blocs -> tableau + version texte
  const descriptionBlocks = Array.isArray(e.description) ? e.description : [];

  // helpers locaux
  const trimTime = (t) => (t ? String(t).slice(0, 5) : null);

  // ---------- OCCURRENCES (shared.date-occurence) ----------
  // NB: ton schéma = "occurences" (orthographe)
  const occRaw = Array.isArray(e.occurences) ? e.occurences : [];
  const occs = [];

  // 1) toutes les occurences saisies dans le champ repeatable
  for (const o of occRaw) {
    const date = toISODate(o?.date ?? o);
    if (!date) continue;
    occs.push({
      date,
      startTime: trimTime(o?.startTime ?? e.startTime),
      endTime:   trimTime(o?.endTime   ?? e.endTime),
    });
  }

  // 2) toujours ajouter la date “de base” si présente (startDate/startTime)
  if (e.startDate) {
    const baseDate = toISODate(e.startDate);
    if (baseDate) {
      occs.push({
        date: baseDate,
        startTime: trimTime(e.startTime),
        endTime:   trimTime(e.endTime),
      });
    }
  }

  // 3) nettoyer (drop sans date) + dédupe + tri
  const seen = new Set();
  const occurrences = [];
  for (const o of occs) {
    if (!o.date) continue;
    const k = `${o.date}|${o.startTime || ""}|${o.endTime || ""}`;
    if (seen.has(k)) continue;
    seen.add(k);
    occurrences.push(o);
  }
  occurrences.sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      String(a.startTime || "").localeCompare(String(b.startTime || ""))
  );

  // bornes & prochaine occurrence
  const first = occurrences[0] || null;
  const last  = occurrences[occurrences.length - 1] || first || null;

  const today = new Date().toISOString().slice(0, 10);
  const nextOccurrence = occurrences.find((o) => o.date >= today) || null;

  // ---------- PRIX ----------
  // supporte une éventuelle liste `prices` (si elle existe),
  // sinon on retombe sur `price` (string) ou `isFree`.
  let prices = Array.isArray(e.prices)
    ? e.prices.map((p) => ({
        label: p.label || "",
        amount: p.amount ?? null,
        currency: p.currency || "CHF",
        note: p.note || "",
      }))
    : [];

  if (!prices.length && (e.price || e.isFree)) {
    prices = [
      {
        label: e.isFree ? "Gratuit" : (e.price || ""),
        amount: null,
        currency: "CHF",
        note: "",
      },
    ];
  }

  const minPrice =
    prices
      .map((p) => (typeof p.amount === "number" ? p.amount : null))
      .filter((v) => v != null)
      .sort((a, b) => a - b)[0] ?? null;

  // ---------- GALERIE ----------
  const gallery = (Array.isArray(e.gallery) ? e.gallery : []).map((g) => {
    const imgAttr =
      g?.image?.data?.attributes ||
      g?.image?.attributes ||
      g?.image ||
      null;
    const rawUrl = imgAttr?.url || g?.src || null;
    const url = mediaURL(rawUrl);
    return {
      type: g?.type || "image",
      image: imgAttr
        ? {
            url,
            mime: imgAttr?.mime,
            alternativeText: imgAttr?.alternativeText || g?.alt || "",
          }
        : null,
      src: url,
      alt: g?.alt || imgAttr?.alternativeText || "",
      caption: g?.caption || "",
    };
  });

  // ---------- SORTIE NORMALISÉE ----------
  return {
    id: e.id,
    slug: e.slug,
    title: e.title,
    documentId: e.documentId || e.document_id || null,
    descriptionBlocks,
    description: blocksToText(descriptionBlocks),
    content: e.content,

    // ✅ occurrences normalisées
    occurrences,        // [{ date:'YYYY-MM-DD', startTime:'HH:MM'|null, endTime:'HH:MM'|null }]
    nextOccurrence,     // { ... } | null

    // dates/horaires “agrégées” (compat avec tes composants existants)
    startDate: e.startDate || first?.date || null,
    endDate:   e.endDate   || last?.date  || (e.startDate || null),
    startTime: trimTime(e.startTime ?? first?.startTime),
    endTime:   trimTime(e.endTime   ?? first?.endTime),

    // prix
    isFree: e.isFree === true,
    price: e.price || null,  // string d’appoint
    prices,                  // liste enrichie (si configurée)
    minPrice,

    isKidsFriendly: e.isKidsFriendly === true,
    ticketUrl: e.ticket_url || null,

    thumbnail: mediaURL(coverUrl),
    gallery,

    categories: pickCategories(e),

    locale: e.locale ?? null,
    publishedAt: e.publishedAt ?? null,
  };
}





export async function getEventBySlug(slug, {
  locale,
  preview = false,
  next = { revalidate: 0 }
} = {}) {
  const params = {
    ...(preview ? { publicationState: "preview" } : {}),
    ...(locale ? { locale } : {}),
    "filters[slug][$eq]": slug,
    "pagination[pageSize]": 1,
    // les champs "classiques" que tu avais déjà
"populate[prices]": "true",
    // les champs "classiques" que tu avais déjà
    "populate[cover]": "true",
    "populate[event_categories]": "true",
    "populate[gallery][populate][image]": "true",
    // localizations si tu veux
    "populate[occurences]": "true",

    "populate[localizations]": "true",
    "populate[localizations][fields][0]": "slug",
    "populate[localizations][fields][1]": "locale",
  };

  const data = await doFetch(`/api/events`, { params, next });
  const entry = data?.data?.[0];

  if (!entry) return null;

  // tu avais déjà mapEvent → on garde la même donnée enrichie
  const mapped = mapEvent(entry);

  // 🔥 on greffe les blocs “tels quels” (v4/v5 compatible)
  mapped.blocks = entry.attributes?.blocks ?? entry.blocks ?? [];

  return mapped;
}


export async function getEventByDocument(documentId, {
  locale,
  preview = false,
  next = { revalidate: 0 }
} = {}) {
  const params = {
    ...(preview ? { publicationState: "preview" } : {}),
    ...(locale ? { locale } : {}),
    "filters[documentId][$eq]": documentId,
    "pagination[pageSize]": 1,
    "populate[occurences]": "true",
"populate[prices]": "true",

    "fields[0]": "slug",
    "fields[1]": "locale",
    "fields[2]": "documentId",
  };

  const data = await doFetch(`/api/events`, { params, next });
  const entry = data?.data?.[0];
  return entry ? mapEvent(entry) : null;
}
export async function getEvents({
  locale = "fr",          // mets "all" si tu veux toutes les locales
  preview = false,        // true => inclut les brouillons (nécessite token)
  pageSize = 100,         // Strapi limite souvent à 100
  params = {},
  next = { revalidate: 0 }
} = {}) {
  const pageSizeClamped = Math.min(Number(pageSize) || 100, 100);

  const base = {
    publicationState: preview ? "preview" : "live",
    ...(locale ? { locale } : {}),
    "populate[cover]": "true",
    "populate[occurences]": "true",

"opulate[prices]": "true",
    "populate[event_categories]": "true",
    "populate[gallery][populate][image]": "true",
    // tri stable pour l’archives/liste

    "sort[0]": "startDate:desc",
    "sort[1]": "endDate:desc",
    ...params,
  };

  let page = 1;
  const all = [];

  while (true) {
    const pageParams = {
      ...base,
      "pagination[page]": page,
      "pagination[pageSize]": pageSizeClamped,
    };

    const data = await doFetch(`/api/events`, { params: pageParams, next });
    const items = data?.data || [];
    const pag = data?.meta?.pagination || {};

    all.push(...items);

    if (!pag?.pageCount || page >= pag.pageCount) break;
    page++;
  }

  return all.map(mapEvent);
}

// --- en bas de app/lib/strapi.js (et exporte) ---
// app/lib/strapi.js
// app/lib/strapi.js
export async function getUpcomingEvents({
  locale = "fr",
  limit = 3,
  preview = false,
  excludeId,
  excludeSlug,
  excludeDocumentId,
  categories = [],
  next = { revalidate: 0 },
} = {}) {
  const today = new Date().toISOString().slice(0, 10);

  // on construit des exclusions robustes
  const exIds = [].concat(excludeId || []).filter(Boolean);
  const exSlugs = [].concat(excludeSlug || []).filter(Boolean);
  const exDocs = [].concat(excludeDocumentId || []).filter(Boolean);

  const base = {
    ...(preview ? { publicationState: "preview" } : {}),
    ...(locale ? { locale } : {}),
    // futur
    "filters[$or][0][startDate][$gte]": today,
    "filters[$or][1][endDate][$gte]": today,

    // exclusions serveur (arrays)
    ...(exIds.length ? Object.fromEntries(exIds.map((v, i) => [`filters[id][$notIn][${i}]`, String(v)])) : {}),
    ...(exSlugs.length ? Object.fromEntries(exSlugs.map((v, i) => [`filters[slug][$notIn][${i}]`, v])) : {}),
    ...(exDocs.length ? Object.fromEntries(exDocs.map((v, i) => [`filters[documentId][$notIn][${i}]`, v])) : {}),

    "sort[0]": "startDate:asc",
    "pagination[pageSize]": String(Math.max(limit, 1) * 4), // on sur-fait
    "populate[cover]": "true",
    "populate[event_categories]": "true",
    "populate[gallery][populate][image]": "true",
  };

  const fetchOnce = async (params) => (await doFetch(`/api/events`, { params, next }).catch(() => null))?.data ?? [];

  let raw = [];
  if (categories?.length) {
    const byCats = { ...base };
    categories.forEach((name, i) => {
      byCats[`filters[event_categories][name][$in][${i}]`] = String(name);
    });
    raw = await fetchOnce(byCats);
  }
  if (raw.length < limit) {
    const extra = await fetchOnce(base);
    raw = [...raw, ...extra];
  }

  // Filtre & dédup côté client (ceinture+bretelles)
  const notSelf = (x) => !(
    (excludeId && x?.id === Number(excludeId)) ||
    (excludeSlug && x?.attributes?.slug === excludeSlug) ||
    (excludeDocumentId && x?.attributes?.documentId === excludeDocumentId)
  );
  const key = (r) => `${r.id}|${r.attributes?.documentId || ""}|${r.attributes?.slug || ""}`;

  const seen = new Set();
  const cleaned = [];
  for (const r of raw) {
    if (!notSelf(r)) continue;
    const k = key(r);
    if (!seen.has(k)) {
      seen.add(k);
      cleaned.push(r);
    }
    if (cleaned.length >= limit * 2) break;
  }

  return cleaned.slice(0, limit + 5).map(mapEvent);
}

// --- NAVIGATION (strapi-plugin-navigation) ---
/**
 * Récupère un container de navigation rendu par le plugin.
 * @param {Object} opts
 * @param {string} opts.tree  slug ou id du container (ex: "main" / "header")
 * @param {string} opts.locale  ex: "fr"
 * @param {"TREE"|"FLAT"|"RFR"} opts.type  structure de sortie
 */
export async function getNavigation({ tree = "navigation", locale = "fr", type = "TREE" } = {}) {
  const params = { type, ...(locale ? { locale } : {}) };
  const data = await doFetch(`/api/navigation/render/${encodeURIComponent(tree)}`, {
    params,
    next: { revalidate: 60 },
  });

  const raw = Array.isArray(data) ? data : (data?.data || []);

  const routeForRelated = (rel) => {
    if (!rel) return null;
    const t = rel.__type || rel.__contentType || "";
    switch (t) {
      case "api::page.page":
        return rel.slug ? `/${rel.slug}` : "/";
      // Ajoute ici d’autres types si besoin (events, blog, etc.)
      default:
        return rel.slug ? `/${rel.slug}` : "/";
    }
  };

  const withLocale = (url) => {
    if (!url) return `/${locale}`;
    if (/^https?:\/\//i.test(url)) return url;         // externe → on ne touche pas
    const clean = url.startsWith("/") ? url : `/${url}`;
    if (clean === "/") return `/${locale}`;            // home → /fr
    if (clean.startsWith(`/${locale}/`) || clean === `/${locale}`) return clean;
    return `/${locale}${clean}`;                       // /fr/slug
  };

  const mapItem = (n) => {
    const title = n.title || n.name || "";

    // 1) Si path est non trivial (≠ "/"), on le garde. Sinon on dérive depuis related.slug
    const candidate =
      (n.path && n.path !== "/" ? n.path : null) ||
      n.url ||                           // parfois le plugin met `url`
      routeForRelated(n.related) ||      // notre reconstruction
      "/";

    const external = /^https?:\/\//i.test(candidate) || n.type === "EXTERNAL";
    const href = external ? candidate : withLocale(candidate);

    const childrenSrc = Array.isArray(n.items) ? n.items :
      Array.isArray(n.children) ? n.children : [];
    const children = childrenSrc.map(mapItem);

    return {
      id: n.id || `${title}:${href}`,
      title,
      href,          // ✅ prêt à être rendu, identique SSR/Client
      external,
      children,
      original: n,
    };
  };

  return raw.map(mapItem);
}


function mapPageNode(entry) {
  if (!entry?.id) return null;
  const a = entry.attributes || {};
  return {
    id: entry.id,
    slug: a.slug,
    pageTitle: a.pageTitle || a.title || a.name || a.slug,
    // important pour la chaîne parents
    parent: a.parent?.data ? mapPageNode(a.parent.data) : null,
  };
}