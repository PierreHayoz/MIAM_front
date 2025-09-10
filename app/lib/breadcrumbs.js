// app/lib/breadcrumbs.js
import { getPageBySlug, getPageByDocument } from "@/app/lib/strapi";

// Slug "programme" overridable par env si besoin
const PROGRAMME_PAGE_SLUG = process.env.NEXT_PUBLIC_PROGRAMME_SLUG || "programme";
const ARCHIVES_PAGE_SLUG  = process.env.NEXT_PUBLIC_ARCHIVES_SLUG  || "archives";

function homeCrumb(locale) {
  return { href: `/${locale}`, label: "Accueil" };
}

// Détermine si un event est archivé (passé)
export function isPastEvent(e) {
  // On prend endDate sinon startDate
  const basis = e?.endDate || e?.startDate;
  if (!basis) return false;
  const now = new Date();
  const end = new Date(basis);
  return end < now;
}

// Remonte la chaîne des parents (root -> ... -> parent immédiat) DANS LA BONNE LOCALE
async function collectPageAncestors(page, locale) {
  const chain = [];
  let parent = page?.parent || null;

  // Si getPageBySlug ne "populate" pas parent, on s'arrête proprement
  if (!parent) return chain;

  // Tant qu'on a un parent, on va chercher sa version dans la bonne locale via documentId
  // (similaire à ton getEventByDocument)
  while (parent) {
    const docId = parent.documentId || parent.id || parent?.attributes?.documentId;
    const p = await getPageByDocument(docId, { locale });

    if (!p) break;
    chain.push({ slug: p.slug, label: p.pageTitle, id: p.id, documentId: p.documentId });
    parent = p.parent || null;
  }

  // On veut du plus-haut vers le plus-proche : root -> ... -> parent
  return chain.reverse();
}

// Breadcrumbs pour une page CMS
export async function buildPageBreadcrumbs({ page, locale }) {
  const items = [homeCrumb(locale)];
  const ancestors = await collectPageAncestors(page, locale);
  items.push(...ancestors.map(a => ({ href: `/${locale}/${a.slug}`, label: a.label })));
  items.push({ label: page.pageTitle }); // la page courante sans lien
  return items;
}

// Breadcrumbs pour une fiche event
export async function buildEventBreadcrumbs({ event: e, locale }) {
  const items = [homeCrumb(locale)];

  // Programme
  const programmePage = await getPageBySlug(PROGRAMME_PAGE_SLUG, { locale });
  if (programmePage) {
    items.push({ href: `/${locale}/${programmePage.slug}`, label: programmePage.pageTitle || "Programme" });
  } else {
    items.push({ href: `/${locale}/${PROGRAMME_PAGE_SLUG}`, label: "Programme" });
  }

  // Archives (si event passé)
  if (isPastEvent(e)) {
    // tu as dit "je link /archives directement sous programme"
    // donc on pointe vers la page /archives (plate), mais la logique breadcrumbs la place sous Programme
    const archivesPage = await getPageBySlug(ARCHIVES_PAGE_SLUG, { locale });
    items.push({
      href: `/${locale}/${archivesPage?.slug || ARCHIVES_PAGE_SLUG}`,
      label: archivesPage?.pageTitle || "Archives",
    });
  }

  // Catégorie (optionnel) — si tu veux insérer la 1re catégorie
  // if (Array.isArray(e.categories) && e.categories.length) {
  //   const first = e.categories[0];
  //   items.push({ href: `/${locale}/${PROGRAMME_PAGE_SLUG}?cat=${encodeURIComponent(first.slug || first)}`, label: first.name || first });
  // }

  // Courant
  items.push({ label: e.title });
  return items;
}
