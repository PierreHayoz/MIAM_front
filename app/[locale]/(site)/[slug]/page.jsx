// app/[locale]/(site)/[slug]/page.jsx
import { notFound } from "next/navigation";
import RenderBlocks from "@/app/components/cms/RenderBlocks";
import { getPageBySlug } from "@/app/lib/strapi";
import RichTextServer from "@/app/components/ui/RichText";
import BreadcrumbsServer from "@/app/components/ui/Breadcrumbs";

export const revalidate = 0;

// ✅ params est une Promise ici — on l'attend
export async function generateMetadata({ params: paramsPromise }) {
  const { locale, slug } = await paramsPromise;

  const page = await getPageBySlug(slug, { locale });
  if (!page) {
    return { title: "Page introuvable" };
  }

  const title = page.seo?.title ?? page.pageTitle ?? "Page";
  const description = page.seo?.description ?? page.parag?.slice(0, 160);
  const urlPath = `/${locale}/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: urlPath,
      languages: page.alternates?.reduce?.((acc, alt) => {
        acc[alt.locale] = `/${alt.locale}/${alt.slug}`;
        return acc;
      }, {}) ?? undefined,
    },
    openGraph: { type: "article", title, description, url: urlPath },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: !page.seo?.noindex, follow: !page.seo?.nofollow },
  };
}

export default async function Page(props) {
  // ✅ idem ici: params ET searchParams sont des Promises
  const { params: paramsPromise, searchParams: spPromise } = props;
  const { locale, slug } = await paramsPromise;
  const sp = await spPromise;

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
