// app/[locale]/(site)/[slug]/page.jsx
import { notFound } from "next/navigation";
import RenderBlocks from "@/app/components/cms/RenderBlocks";
import { getPageBySlug } from "@/app/lib/strapi";
import RichTextServer from "@/app/components/ui/RichText";
import BreadcrumbsServer from "@/app/components/ui/Breadcrumbs";

export const revalidate = 0;

// 👇 Ajoute ceci
export async function generateMetadata({ params }) {
  const { locale, slug } = params;

  const page = await getPageBySlug(slug, { locale });
  if (!page) {
    // Tu peux soit retourner un titre 404, soit déclencher une 404 ici
    // notFound();
    return { title: "Page introuvable" };
  }

  const title = page.seo?.title ?? page.pageTitle ?? "Page";
  const description = page.seo?.description ?? page.parag?.slice(0, 160);

  // Si tu as défini metadataBase dans le root layout, tu peux mettre des URLs relatives
  const urlPath = `/${locale}/${slug}`;

  return {
    title,               
    description,
    alternates: {
      canonical: urlPath,
      // hreflang si tu as d’autres locales:
      languages: page.alternates?.reduce?.((acc, alt) => {
        acc[alt.locale] = `/${alt.locale}/${alt.slug}`;
        return acc;
      }, {}) ?? undefined,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: urlPath,
      // images: [{ url: `/api/og?title=${encodeURIComponent(title)}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: !page.seo?.noindex,
      follow: !page.seo?.nofollow,
    },
  };
}

export default async function Page({ params, searchParams }) {
  const { locale, slug } = params;
  const sp = searchParams;

  const page = await getPageBySlug(slug, { locale });
  if (!page) return notFound();

  return (
    <div className="px-4">
      <BreadcrumbsServer page={page} locale={locale} />
      <div className="grid grid-cols-4 gap-2">
        <h1 className="text-3xl md:col-span-1 col-span-4">{page.pageTitle}</h1>
        <div className="col-span-4 md:col-span-2">
          <RichTextServer value={page.parag} />
        </div>
      </div>
      <RenderBlocks blocks={page.blocks || []} locale={locale} searchParams={sp} />
    </div>
  );
}
