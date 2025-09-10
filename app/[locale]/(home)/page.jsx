import { getHomepage, getGlobal, getUpcomingEvents } from "@/app/lib/strapi";
import EventsSuggestionsBlock from "@/app/components/cms/EventsSuggestionsBlock";
import SectionCtaBlock from "@/app/components/cms/SectionCTABlock";
import PartnersListBlock from "@/app/components/cms/PartnersListBlock";
import MidParagraph from "@/app/components/paragraphs/MidParagraph";
const typeOf = (b) => b?.__component || b?.component || b?.type || "";

export default async function HomePage({ params }) {
  const locale = params?.locale ?? "fr";
  const [homepage, global] = await Promise.all([getHomepage({ locale }), getGlobal({ locale })]);
  const homeBlocks = Array.isArray(homepage?.blocks) ? homepage.blocks : [];
  const globalBlocks = Array.isArray(global?.blocks) ? global.blocks : [];
  const sug = globalBlocks.find(b => typeOf(b) === "shared.events-suggestions");
  const limit = Number(sug?.limit ?? 3);
  const items = sug ? (await getUpcomingEvents({ locale, limit })).slice(0, limit) : [];
  return (
    <div className="py-16">
      {sug && (
        <section className="mt-12 px-4">
          {sug.title && <h2 className="text-xl mb-4">{sug.title}</h2>}
            <EventsSuggestionsBlock items={items} locale={locale} />
        </section>
      )}
      {homeBlocks.map((b, i) => {
        const t = typeOf(b);
        console.log(b.text)

        switch (t) {
          case "shared.section-cta":
            return <SectionCtaBlock key={`cta-${b.id ?? i}`} block={b} locale={locale} />;
          case "blocks.partners-list":
            return <PartnersListBlock key={`partners-${b.id ?? i}`} block={b} />;
            case "blocks.mid-paragraph":
            return (<div key={`mid-${b.id ?? `idx-${idx}`}`} className="grid grid-cols-4">
            <div className="md:col-span-2 md:col-start-2 col-span-4">
              <MidParagraph text={b.text} />
            </div>
          </div>)
          default:
            return null;
        }
      })}
    </div>
  );
}
