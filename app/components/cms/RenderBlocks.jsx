import Paragraphs from "../../components/paragraphs/Paragraphs";
import MidParagraph from "../../components/paragraphs/MidParagraph";
import CardsListServer from "../cards/CardsList";
import GalleryMedia from "./GalleryMedia";
import BannerImage from "./BannerImage";
import {
  getCommission,
  getEvents, getGlossaires, getMembres,
  getNomade
} from "@/app/lib/strapi";
import RichTextServer from "../ui/RichText";
import DirectoryReveal, { mapStrapi } from "../DirectoryReveal";
import PartnersStrip from "../partners/Partners";
import ContactMap from "./ContactMap";
import Link from "next/link";

// utils
const todayISO = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD
const sortParam = (s) => (s === "date_desc" ? "startDate:desc" : "startDate:asc");

export default async function RenderBlocks({ blocks = [], locale, searchParams }) {
  if (!Array.isArray(blocks) || blocks.length === 0) return null;
  const glossaireGetters = {
    getKey: (e) => e?.id ?? e?.documentId,
    getName: (e) => {
      const a = mapStrapi.getAttrs(e);
      return a?.nom ?? a?.name ?? a?.title ?? "—";
    },
    getInline: () => "",
    getDescription: (e) => {
      const a = mapStrapi.getAttrs(e);
      return a?.definition ?? a?.description ?? "";
    },
    getThumbnail: (e) => {
      const a = mapStrapi.getAttrs(e);
      return mapStrapi.getMediaUrl(
        a?.image ?? a?.photo ?? a?.media ?? a?.illustration ?? a?.cover
      );
    },
  };
const nomadeGetters = {
  getKey: (e) => e?.id ?? e?.documentId,
  getName: (e) => {
    const a = mapStrapi.getAttrs(e);
    return a?.nom ?? a?.name ?? a?.title ?? "—";
  },
  getInline: (e) => {
    const a = mapStrapi.getAttrs(e);
    return a?.position ?? a?.role ?? a?.fonction ?? "";
  },
  getDescription: (e) => {
    const a = mapStrapi.getAttrs(e);
    return a?.presentation ?? a?.description ?? "";
  },
  getThumbnail: (e) => {
    const a = mapStrapi.getAttrs(e);
    return mapStrapi.getMediaUrl(a?.photo ?? a?.image);
  },
};
const commissionGetters = {
  getKey: (e) => e?.id ?? e?.documentId,
  getName: (e) => {
    const a = mapStrapi.getAttrs(e);
    return a?.nom ?? a?.name ?? a?.title ?? "—";
  },
  getInline: (e) => {
    const a = mapStrapi.getAttrs(e);
    return a?.position ?? a?.role ?? a?.fonction ?? "";
  },
  getDescription: (e) => {
    const a = mapStrapi.getAttrs(e);
    return a?.presentation ?? a?.description ?? "";
  },
  getThumbnail: (e) => {
    const a = mapStrapi.getAttrs(e);
    return mapStrapi.getMediaUrl(a?.photo ?? a?.image);
  },
};
  const membresGetters = {
    getKey: (e) => e?.id ?? e?.documentId,
    getName: (e) => {
      const a = mapStrapi.getAttrs(e);
      return a?.nom ?? a?.name ?? "—";
    },
    getInline: (e) => {
      const a = mapStrapi.getAttrs(e);
      return a?.position ?? a?.role ?? a?.fonction ?? "";
    },
    getDescription: (e) => {
      const a = mapStrapi.getAttrs(e);
      return a?.presentation ?? a?.description ?? "";
    },
    getThumbnail: (e) => {
      const a = mapStrapi.getAttrs(e);
      return mapStrapi.getMediaUrl(a?.photo ?? a?.image);
    },
  };
  const out = [];

  for (let idx = 0; idx < blocks.length; idx++) {
    const b = blocks[idx];
    const type = b?.__component;
    switch (type) {
      case "blocks.partners-list": {
        const bAttrs = b?.attributes ?? b; // v4/v5 compatible
        const paragraphe = bAttrs.paragraphe;

        const items =
          (Array.isArray(bAttrs?.partners?.data) && bAttrs.partners.data) ||
          (Array.isArray(bAttrs?.partners) && bAttrs.partners) ||
          [];

        out.push(
          <section key={`partners-${b.id ?? `idx-${idx}`}`} className="grid grid-cols-4  py-6">
            <div className="md:col-span-2 col-span-4 md:col-start-2">
              {paragraphe ? (
                <div className="mb-6 col-span-4">
                  <RichTextServer value={paragraphe} />
                </div>
              ) : null}
            </div>
            <div className="md:col-span-2 md:col-start-2 col-span-4">
              <PartnersStrip items={items} />
            </div>
          </section>
        );
        break;
      }
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
      case "blocks.membres": {
        const items = await getMembres({ locale });
        out.push(
          <div className="md:grid md:grid-cols-4">
            <div className="col-start-2 col-span-2">
              <DirectoryReveal items={items} heading={b.title} getters={membresGetters} />
            </div>
          </div>);;
        break;
      }

      case "blocks.nomade": {
        const items = await getNomade({ locale });
        console.log(items,'léeoooool')
        out.push(
          <div className="md:grid md:grid-cols-4">
            <div className="col-start-2 col-span-2">
              <DirectoryReveal items={items} heading={b.title} getters={nomadeGetters} />
            </div>
          </div>);
        break;
      }
      case "blocks.commission": {
        const items = await getCommission({ locale });
        console.log("HELLLLLL")
        out.push(
          <div className="md:grid md:grid-cols-4">
            <div className="col-start-2 col-span-2">
              <DirectoryReveal items={items} heading={b.title} getters={commissionGetters} />
            </div>
          </div>);
        break;
      }
      case "blocks.glossaires": {
        const items = await getGlossaires({ locale });
        out.push(
          <div className="md:grid md:grid-cols-4">
            <div className="col-start-2 col-span-2">
              <DirectoryReveal items={items} heading={b.title} getters={glossaireGetters} />
            </div>
          </div>);;
        break;
      }
      case "blocks.button": {
        out.push(
          <div className="md:grid md:grid-cols-4">
            <div className="md:col-start-2 md:col-span-2">
            <Link
              href={b.externalURL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 rounded-xs border border-MIAMblack text-MIAMblack w-fit hover:bg-MIAMblack hover:text-white transition-colors"
            >
              {b.label || "En savoir plus"}
            </Link>
            </div>
          </div>
        );
        break;
      }


      case 'blocks.map': {
        out.push(
          <div key={`map-${b.id ?? `idx-${idx}`}`} className="grid grid-cols-4 py-8">
            <div className="col-span-4">
              <ContactMap lat={b.latitude} lng={b.longitude} label={b.label} />
            </div>
          </div>
        );
        break;
      }

      case "blocks.paragraphes": {
        out.push(
          <div key={`paragraphes-${b.id ?? `idx-${idx}`}`} className="grid grid-cols-4 pb-8">
            <div className="md:col-start-2 md:col-span-2 col-span-4">
              <RichTextServer value={b.paragraphe} />
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
        break;
    }
  }
  return <>{out}</>;
}
