// app/components/ui/BreadcrumbsServer.jsx
import React from "react";
import Link from "next/link";
import { buildPageBreadcrumbs, buildEventBreadcrumbs } from "@/app/lib/breadcrumbs";

// Composant serveur
export default async function BreadcrumbsServer({ locale, page = null, event = null, items = null }) {
  let crumbs = items;

  if (!crumbs) {
    if (page) {
      crumbs = await buildPageBreadcrumbs({ page, locale });
    } else if (event) {
      crumbs = await buildEventBreadcrumbs({ event, locale });
    } else {
      crumbs = [{ href: `/${locale}`, label: "Accueil" }];
    }
  }

  // JSON-LD (SEO BreadcrumbList)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: c.href } : {}),
    })),
  };

  return (
    <>
      <nav aria-label="Fil d’Ariane" className="mb-4 text-sm text-MIAMgreytext">
        <ol className="flex flex-wrap items-center gap-1">
          {crumbs.map((c, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <li key={`${c.label}-${i}`} className="flex items-center gap-1">
                {c.href && !isLast ? (
                  <Link href={c.href} className="hover:underline">{c.label}</Link>
                ) : (
                  <span aria-current={isLast ? "page" : undefined} className={isLast ? "font-medium text-MIAMblack" : ""}>
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
