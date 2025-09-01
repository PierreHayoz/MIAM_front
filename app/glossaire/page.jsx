import Paragraphs from "../components/paragraphs/Paragraphs";
import RevealList from "../components/reveal/RevealList";
import { getGlossary } from "../lib/glossary";


export const metadata = {
  title: "Glossaire — MIAM",
  description: "Termes autour du son 3D, de l’électroacoustique et des arts spatiaux.",
};


export default async function Page() {
  const getTitleGloss = (t) => (
  <div className="grid grid-cols-2 justify-between">
    <span>{t.term}</span>
    <span className="text-MIAMgreytext">&nbsp;</span>
  </div>
);
  const terms = await getGlossary();
  return (
    <section>
      <div className="grid grid-cols-4 px-4 gap-8">
        <h2 className="text-3xl">Glossaire</h2>
        <div className="col-span-2">
          <Paragraphs
            title="Ressources"
            type="list"
            items={await getGlossary()}
            variant="text"
            getTitle={getTitleGloss}
            getDescription={(t) => t.definition}
          /></div>
      </div>
    </section>
  );
}