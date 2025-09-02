const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL;
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

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
export async function getPageBySlug(slug, { locale = "fr", preview = false } = {}) {
  const params = {
    ...(preview ? { publicationState: "preview" } : {}),
    "filters[slug][$eq]": slug,
    "locale": locale,
    "pagination[pageSize]": 1,
    "populate[blocks][on][blocks.events-list][populate]": "true",
    // tes populates existants…
    "populate[blocks][on][blocks.paragraphes][populate]": "*",

    "populate[blocks][on][blocks.banner][populate]": "*",
    "populate[blocks][on][blocks.paragraph][populate]": "*",
    "populate[blocks][on][blocks.paragraphes][populate]": "*",
    "populate[blocks][on][blocks.mid-paragraph][populate]": "*",
    "populate[blocks][on][blocks.gallery-media][populate][gallery][populate]": "*",
    "populate[blocks][on][blocks.paragraphes][populate]": "*",

    "populate[blocks][populate][pageIntro]" : "*",
  };

  const data = await doFetch(`/api/pages`, { params, next: { revalidate: 0 } });
  console.log(data)
  return normalizeEntry(data?.data?.[0]);
}
export async function getGlobal({
  locale = "fr",
  preview = false,
  next = { revalidate: 600 }, // ajuste le cache si besoin
} = {}) {
  const params = {
    ...(preview ? { publicationState: "preview" } : {}),
    ...(locale ? { locale } : {}),
    "populate":"*"// nécessite que tu aies bien ajouté socialLinks sur Global
  };

  const data = await doFetch(`/api/global`, { params, next });
  return normalizeEntry(data?.data);
}
// 👉 nouveau : récupérer une traduction via l’ID de l’entrée
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

function mapEvent(entry) {
  const e = entry?.attributes ? { id: entry.id, ...entry.attributes } : (entry || {});
  const coverUrl = e.cover?.data?.attributes?.url ?? e.cover?.url ?? null;

  const descriptionBlocks = Array.isArray(e.description) ? e.description : [];
  const contentBlocks = Array.isArray(e.content) ? e.content : [];

  const gallery = (Array.isArray(e.gallery) ? e.gallery : []).map(g => {
    const imgAttr =
      g?.image?.data?.attributes ||
      g?.image?.attributes ||
      g?.image || null;

    const rawUrl = imgAttr?.url || g?.src || null;
    const url = mediaURL(rawUrl);

    return {
      type: g?.type || 'image',
      image: imgAttr ? {
        url,
        mime: imgAttr?.mime,
        alternativeText: imgAttr?.alternativeText || g?.alt || ''
      } : null,
      src: url,
      alt: g?.alt || imgAttr?.alternativeText || '',
      caption: g?.caption || '',
    };
  });

  const trim = (t) => (t ? String(t).slice(0, 5) : null);

  return {
    id: e.id,
    slug: e.slug,
    title: e.title,

    descriptionBlocks,
    contentBlocks,

    description: blocksToText(descriptionBlocks),
    content: blocksToText(contentBlocks),

    startDate: e.startDate || null,
    endDate: e.endDate || e.startDate || null,
    startTime: trim(e.startTime),
    endTime: trim(e.endTime),

    isFree: e.isFree === true,
    price: e.price || null,
    isKidsFriendly: e.isKidsFriendly === true,
    ticketUrl: e.ticket_url || null,

    thumbnail: mediaURL(coverUrl),
    gallery,

    categories: pickCategories(e),

    // 👇 utiles pour comprendre pourquoi “ça n’apparait pas”
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
    "populate[cover]": "true",
    "populate[event_categories]": "true",
    "populate[gallery][populate][image]": "true",

    "populate[localizations]": "true",
    "populate[localizations][fields][0]": "slug",
    "populate[localizations][fields][1]": "locale",
  };

  const data = await doFetch(`/api/events`, { params, next });
  const entry = data?.data?.[0];
  return entry ? mapEvent(entry) : null;
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
export async function getUpcomingEvents({
  locale = "fr",
  limit = 3,
  preview = false,
  excludeDocumentId,
  excludeSlug,
  categories = [], // tableau de noms (ta mapEvent renvoie des noms)
  next = { revalidate: 300 },
} = {}) {
  const today = new Date().toISOString().slice(0, 10);

  // Base: événements à venir (startDate >= today OU endDate >= today)
  const base = {
    ...(preview ? { publicationState: "preview" } : {}),
    ...(locale ? { locale } : {}),
    "filters[$or][0][startDate][$gte]": today,
    "filters[$or][1][endDate][$gte]": today,
    ...(excludeDocumentId ? { "filters[documentId][$ne]": excludeDocumentId } : {}),
    ...(excludeSlug ? { "filters[slug][$ne]": excludeSlug } : {}),
    "sort[0]": "startDate:asc",
    "pagination[pageSize]": String(limit),
    "populate[cover]": "true",
    "populate[event_categories]": "true",
    "populate[gallery][populate][image]": "true",
  };

  // 1) Essai avec filtre de catégories (si fourni)
  let primary = [];
  if (categories?.length) {
    const byCats = { ...base };
    categories.forEach((name, i) => {
      byCats[`filters[event_categories][name][$in][${i}]`] = String(name);
    });
    const data = await doFetch(`/api/events`, { params: byCats, next }).catch(() => null);
    primary = data?.data ?? [];
  }

  // 2) Compléter sans filtre si on n'en a pas assez
  let results = [...primary];
  if (results.length < limit) {
    const all = await doFetch(`/api/events`, {
      params: { ...base, "pagination[pageSize]": String(limit * 2) },
      next,
    }).catch(() => null);
    const extra = all?.data ?? [];

    const seen = new Set(results.map(r => r.documentId || r.id));
    for (const r of extra) {
      const key = r.documentId || r.id;
      if (!seen.has(key)) {
        results.push(r);
        seen.add(key);
      }
      if (results.length >= limit) break;
    }
  }

  return results.slice(0, limit).map(mapEvent);
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