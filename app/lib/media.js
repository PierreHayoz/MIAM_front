import { STRAPI_URL } from "./strapi";

export function absoluteStrapiUrl(url) {
  if (!url) return null;
  return url.startsWith("http") ? url : `${STRAPI_URL}${url}`;
}

// Retourne l’URL du média (image/vidéo) quelle que soit la forme Strapi
export function mediaSrc(m) {
  if (!m) return null;

  // string brute ou objet avec url
  if (typeof m === "string") return absoluteStrapiUrl(m);
  if (m.url) return absoluteStrapiUrl(m.url);

  // relation single: { data: { attributes: { url } } } OU { data: { url } }
  if (m.data && !Array.isArray(m.data)) {
    const a = m.data.attributes || m.data;
    return absoluteStrapiUrl(a?.url);
  }

  // relation multiple: { data: [ { attributes: { url } } ] }
  if (Array.isArray(m.data) && m.data.length) {
    const a = m.data[0].attributes || m.data[0];
    return absoluteStrapiUrl(a?.url);
  }

  return null;
}

export function mediaMime(m) {
  const a =
    m?.mime ||
    m?.data?.attributes?.mime ||
    (Array.isArray(m?.data) ? m.data[0]?.attributes?.mime : null);
  return a || "";
}

export function mediaAlt(m) {
  const a =
    m?.alternativeText ||
    m?.data?.attributes?.alternativeText ||
    (Array.isArray(m?.data) ? m.data[0]?.attributes?.alternativeText : null) ||
    m?.name ||
    m?.data?.attributes?.name;
  return a || "";
}
