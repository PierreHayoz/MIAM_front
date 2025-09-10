// app/components/blocks/BlockMembreServer.jsx  (Server Component)
import Image from "next/image";

const CMS_URL = "http://localhost:1337";
const mediaUrl = (url) => (url?.startsWith("http") ? url : `${CMS_URL}${url || ""}`);

export default async function BlockMembreServer({
  block,          // l’objet "b" venant de ta DZ (peut contenir b.membres?.data)
  items,          // OPTION A: tu passes directement la collection [{id, attributes}, ...]
  heading,        // surcharges éventuelles
  pageSize = 24,  // limite d’affichage
}) {
  // 1) Source des membres : priorité aux "items" passés en props
  let list = Array.isArray(items) ? items : block?.membres?.data || [];

  // 2) Normalisation (compat v4/v5)
  const rows = list.slice(0, pageSize).map((node) => {
    const id = node?.id ?? node?.documentId ?? Math.random().toString(36).slice(2);
    const a = node?.attributes ?? node; // si déjà aplati
    const photo = a?.photo?.data?.attributes?.url || a?.photo?.url || a?.photo;
    return {
      id,
      name: a?.name || a?.title || "—",
      email: a?.email || "",
      img: photo ? mediaUrl(photo) : null,
    };
  });

  return (
    <section className="w-full">
      <h2 className="text-3xl font-semibold mb-6">
        {heading ?? block?.heading ?? "Membres"}
      </h2>

      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {rows.map((m) => (
          <li key={m.id} className="rounded-2xl border p-4 shadow-sm">
            {m.img ? (
              <Image
                src={m.img}
                alt={m.name}
                width={400}
                height={400}
                className="w-full h-auto rounded-xl object-cover"
              />
            ) : null}
            <h3 className="mt-3 font-medium">{m.name}</h3>
            {m.email ? <p className="text-sm text-gray-500">{m.email}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
