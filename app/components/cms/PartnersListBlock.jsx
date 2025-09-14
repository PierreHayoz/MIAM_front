// app/components/cms/blocks/PartnersListBlock.jsx
import RichTextServer from "../ui/RichText";
import PartnersStrip from "../partners/Partners";

export default function PartnersListBlock({ block }) {
  // Strapi v4/v5 : block peut être plat ou avec attributes
  const b = block?.attributes ?? block ?? {};
  const paragraphe = b.paragraphe ?? null;

  const items =
    (Array.isArray(b?.partners?.data) && b.partners.data) ||
    (Array.isArray(b?.partners) && b.partners) ||
    [];

  return (
    <section className="grid grid-cols-1 md:grid-cols-4 px-4">
        <div className="md:col-span-2 md:col-start-2">
      {paragraphe ? (
        <div className="mb-6">
          <RichTextServer value={b.paragraphe} />
        </div>
      ) : null}
      <PartnersStrip items={items} />
      </div>
    </section>
  );
}
