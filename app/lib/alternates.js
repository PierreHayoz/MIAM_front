import { locales } from "../i18n";
import { getPageBySlug, getPageByDocument } from "@/app/lib/strapi";

function splitPath(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  return { locale: parts[0], rest: parts.slice(1) };
}

/** Retourne un mapping { [locale]: "/<locale>/<slug>" } sans utiliser fetch/NextResponse */
export async function resolveAlternates(pathname) {
  const { locale, rest } = splitPath(pathname);

  if (!locales.includes(locale)) return {};

  if (rest.length === 0) {
    return Object.fromEntries(locales.map((l) => [l, `/${l}`]));
  }

  const slug = rest[rest.length - 1];

  try {
    const page = await getPageBySlug(slug, { locale });
    if (!page) {
      return Object.fromEntries(locales.map((l) => [l, `/${[l, ...rest].join("/")}`]));
    }

    const alternates = {
      [locale]: `/${locale}/${page.slug}`,
    };

    const locs = page?.localizations?.data || [];
    for (const loc of locs) {
      const l = loc?.attributes?.locale;
      const s = loc?.attributes?.slug;
      if (l && s) alternates[l] = `/${l}/${s}`;
    }

    // 2) via documentId pour compléter
    const docId = page?.documentId;
    const missing = locales.filter((l) => !alternates[l]);
    if (docId && missing.length) {
      const resolved = await Promise.all(
        missing.map(async (l) => {
          try {
            const t = await getPageByDocument(docId, { locale: l });
            return t?.slug ? [l, `/${l}/${t.slug}`] : null;
          } catch {
            return null;
          }
        })
      );
      resolved.filter(Boolean).forEach(([l, url]) => {
        alternates[l] = url;
      });
    }

    // 3) filet de sécurité
    for (const l of locales) {
      if (!alternates[l]) alternates[l] = `/${l}/${rest.join("/")}`;
    }

    return alternates;
  } catch {
    return Object.fromEntries(locales.map((l) => [l, `/${[l, ...rest].join("/")}`]));
  }
}
