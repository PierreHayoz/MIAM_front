// app/components/ui/BreadcrumbsServer.jsx
import React from "react";
import Link from "next/link";
import { buildPageBreadcrumbs, buildEventBreadcrumbs } from "@/app/lib/breadcrumbs";

// i18n minimal
const UI = {
  fr: { home: "Accueil", aria: "Fil d’Ariane" },
  en: { home: "Home",    aria: "Breadcrumbs" },
  de: { home: "Startseite", aria: "Navigationspfad" },
};
const baseLang = (l) => String(l || "fr").toLowerCase().split("-")[0];
const t = (l, k) => UI[baseLang(l)]?.[k] ?? UI.en[k] ?? k;

// détecte si un href correspond à la home pour une locale donnée
function isHomeHref(href, locale) {
  const strip = (s) => String(s || "").replace(/\/+$/, ""); // supprime le trailing slash
  const h = strip(href);
  const l = baseLang(locale);
  return (
    h === "" ||              // "/"
    h === "/" ||             // sécurité
    h === `/${l}` ||         // "/fr", "/en", "/de"
    h === `/${strip(locale)}`// "/fr-CH" éventuel
  );
}

export default async function BreadcrumbsServer({ locale, page = null, event = null, items = null }) {
  let crumbs = items;

  if (!crumbs) {
    if (page) {
      crumbs = await buildPageBreadcrumbs({ page, locale });
    } else if (event) {
      crumbs = await buildEventBreadcrumbs({ event, locale });
    } else {
      // fallback par défaut → déjà localisé
      crumbs = [{ href: `/${locale}`, label: t(locale, "home") }];
    }
  }

  // harmonise le libellé du crumb "home" quelle que soit la source
  const localizedCrumbs = (Array.isArray(crumbs) ? crumbs : []).map((c, i) => {
    if (c?.href && isHomeHref(c.href, locale)) {
      return { ...c, label: t(locale, "home") };
    }
    // si certains builders mettent "Accueil" en dur, on le remplace aussi
    if (!c?.href && i === 0 && (c?.label || "").toLowerCase().includes("accueil")) {
      return { ...c, label: t(locale, "home") };
    }
    return c;
  });

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: localizedCrumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: c.href } : {}),
    })),
  };

  return (
    <>
      <nav aria-label={t(locale, "aria")} className="mb-4 text-sm text-MIAMgreytext">
        <ol className="flex flex-wrap items-center gap-1">
          {localizedCrumbs.map((c, i) => {
            const isLast = i === localizedCrumbs.length - 1;
            return (
              <li key={`${c.label}-${i}`} className="flex items-center gap-1">
                {c.href && !isLast ? (
                  <Link href={c.href} className="hover:underline">{c.label}</Link>
                ) : (
                  <span
                    aria-current={isLast ? "page" : undefined}
                    className={isLast ? "font-medium text-MIAMblack" : ""}
                  >
                    {c.label}
                  </span>
                )}
                {!isLast && <span className="px-1">/</span>}
              </li>
            );
          })}
        </ol>
      </nav>

      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
