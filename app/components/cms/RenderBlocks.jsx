// app/components/cms/RenderBlocks.jsx  (Server Component — pas de "use client")
import Paragraphs from "../../components/paragraphs/Paragraphs";
import MidParagraph from "../../components/paragraphs/MidParagraph";
import CardsListServer from "../cards/CardsList";
import GalleryMedia from "./GalleryMedia";
import BannerImage from "./BannerImage";
import { getEvents } from "@/app/lib/strapi"; // 👈 manquait

// utils
const todayISO = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD
const sortParam = (s) => (s === "date_desc" ? "startDate:desc" : "startDate:asc");

export default async function RenderBlocks({ blocks = [], locale, searchParams }) {
  if (!Array.isArray(blocks) || blocks.length === 0) return null;

  const out = [];

  for (let idx = 0; idx < blocks.length; idx++) {
    const b = blocks[idx];
    const type = b?.__component;
    switch (type) {
      case "blocks.events-list": {
        // config bloc

        const cfg = {
          defaultRange: b.defaultRange ?? "all",
          showFilters: b.showFilters ?? true,
          onlyUpcoming: b.onlyUpcoming ?? true,
          pageSize: b.pageSize ?? 60,
          sort: b.sort ?? "date_asc",
          categoriesIds: (b.categories?.data || []).map((x) => x?.id).filter(Boolean),
          // si tu as documentId côté catégories, tu peux aussi le récupérer ici
        };

        // params Strapi (en direct → on évite la construction “filters[${k}]” fragile)
        const params = {};
        if (cfg.onlyUpcoming) {
          const t = todayISO();
          params["filters[$or][0][endDate][$gte]"] = t;
          params["filters[$or][1][startDate][$gte]"] = t;
        }
        // filtre catégories (par IDs) — OK en v4/v5
        cfg.categoriesIds.forEach((id, i) => {
          params[`filters[event_categories][id][$in][${i}]`] = String(id);
        });
        params.sort = sortParam(cfg.sort);
        params["pagination[pageSize]"] = cfg.pageSize;

        // fetch events (⚠️ locale)
        const events = await getEvents({ locale, params, next: { revalidate: 60 } });

        // range par défaut du bloc, sauf si l’utilisateur a déjà choisi via ?t=
        const tEff =
          searchParams?.t ??
          (["week", "month", "year"].includes(cfg.defaultRange) ? cfg.defaultRange : undefined);
        const spEff = tEff ? { ...searchParams, t: tEff } : searchParams;

        // rendu
        out.push(
          <section key={`events-list-${b.id ?? `idx-${idx}`}`} className="mt-8">
            <div className="grid grid-cols-4 gap-2 px-4">
              <h2 className="text-3xl md:col-span-1 col-span-4">{cfg.heading}</h2>
              {cfg.intro ? (
                <div className="col-span-4 md:col-span-2 text-MIAMgrey">
                  <div dangerouslySetInnerHTML={{ __html: cfg.intro }} />
                </div>
              ) : null}
            </div>

            <CardsListServer
              events={events}
              searchParams={spEff}
              locale={locale}
              showFilters={cfg.showFilters}
            />
          </section>
        );
        break;
      }

      case "blocks.paragraph": {
        const isList = b.type === "list";
        const variant =
          b.variant || (isList ? (b.items?.[0]?.photo ? "avatar" : "text") : "text");

        out.push(
          <div key={`paragraph-${b.id ?? `idx-${idx}`}`} className="grid grid-cols-4 pb-8">
            <div className="md:col-start-2 md:col-span-2 col-span-4">
              <Paragraphs
                title={b.title}
                subtitle={b.subtitle}
                text={b.text}
                type={isList ? "list" : undefined}
                items={isList ? b.items || [] : []}
                variant={variant}
                revealProps={{ revealSide: "right", arrow: true }}
              />
            </div>
          </div>
        );
        break;
      }

      case "blocks.banner": {
        const media = b.image ?? b.media ?? b.photo ?? b.file ?? b.url;
        out.push(
          <div key={`banner-${b.id ?? `idx-${idx}`}`} className="py-16 col-span-4 h-full w-full">
            <BannerImage media={media} alt={b.alt || ""} />
          </div>
        );
        break;
      }

      case "blocks.mid-paragraph": {
        out.push(
          <div key={`mid-${b.id ?? `idx-${idx}`}`} className="grid grid-cols-4">
            <div className="md:col-span-2 md:col-start-2 col-span-4">
              <MidParagraph text={b.text} />
            </div>
          </div>
        );
        break;
      }

      case "blocks.gallery-media": {
        const items = Array.isArray(b.gallery?.data) ? b.gallery.data : b.gallery || [];
        out.push(
          <div key={`gallery-${b.id ?? `idx-${idx}`}`} className="grid grid-cols-4 w-full">
            <GalleryMedia items={items} />
          </div>
        );
        break;
      }

      default:
        // bloc inconnu → ignore
        break;
    }
  }

  // ✅ un seul return, aucune logique JSX hors composant
  return <>{out}</>;
}
