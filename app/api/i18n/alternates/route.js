import { NextResponse } from "next/server";
import { locales } from "@/app/i18n";
import { getPageBySlug, getPageByDocument } from "@/app/lib/strapi";

function splitPath(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  return { locale: parts[0], rest: parts.slice(1) };
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const pathname = searchParams.get("pathname") || "/";
  const { locale, rest } = splitPath(pathname);

  if (!locales.includes(locale)) {
    return NextResponse.json({ alternates: {} });
  }

  if (rest.length === 0) {
    const out = Object.fromEntries(locales.map(l => [l, `/${l}`]));
    return NextResponse.json({ alternates: out });
  }

  const slug = rest[rest.length - 1];

  try {
    const page = await getPageBySlug(slug, { locale });
    if (!page) {
      const fb = Object.fromEntries(locales.map(l => [l, `/${[l, ...rest].join("/")}`]));
      return NextResponse.json({ alternates: fb });
    }

    const alternates = {};
    alternates[locale] = `/${locale}/${page.slug}`;

    // 1) via localizations (quand dispo)
    const locs = page?.localizations?.data || [];
    for (const loc of locs) {
      const l = loc?.attributes?.locale;
      const s = loc?.attributes?.slug;
      if (l && s) alternates[l] = `/${l}/${s}`;
    }

    // 2) via documentId pour les locales manquantes (Strapi v5-friendly)
    const docId = page?.documentId;
    const missing = locales.filter(l => !alternates[l]);
    if (docId && missing.length) {
      const resolved = await Promise.all(missing.map(async l => {
        try {
          const t = await getPageByDocument(docId, { locale: l });
          return t?.slug ? [l, `/${l}/${t.slug}`] : null;
        } catch { return null; }
      }));
      resolved.filter(Boolean).forEach(([l, url]) => { alternates[l] = url; });
    }

    // 3) filet de sécurité
    for (const l of locales) {
      if (!alternates[l]) alternates[l] = `/${l}/${rest.join("/")}`;
    }

    return NextResponse.json({ alternates });
  } catch {
    const fb = Object.fromEntries(locales.map(l => [l, `/${[l, ...rest].join("/")}`]));
    return NextResponse.json({ alternates: fb });
  }
}
