// app/[locale]/(site)/[slug]/page.jsx
import { notFound } from "next/navigation";
import RenderBlocks from "@/app/components/cms/RenderBlocks";
import Paragraphs from "@/app/components/paragraphs/Paragraphs";
import { getPageBySlug } from "@/app/lib/strapi";
import RichTextServer from "@/app/components/ui/RichText";

export const revalidate = 0;

export default async function Page({ params, searchParams }) {
  const { locale, slug } = await params;
  const sp = await searchParams;

  const page = await getPageBySlug(slug, { locale });
  if (!page) return notFound();

  return (
    <div className="px-4">
      <div className="grid grid-cols-4 gap-2">
        <h1 className="text-3xl md:col-span-1 col-span-4">{page.pageTitle}</h1>
        <div className="col-span-4 md:col-span-2">
          <RichTextServer value={page.parag}/>
        </div>
      </div>
      <RenderBlocks blocks={page.blocks || []} locale={locale} searchParams={sp} />
    </div>
  );
}
