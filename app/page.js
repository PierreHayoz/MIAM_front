import AssociationSection from "./components/association/AssociationSection";
import EventsSection from "./components/programme/EventsSection";
import Hero from "./components/hero/Hero";
import MidParagraph from "./components/paragraphs/MidParagraph";
import Partners from "./components/partners/Partners";
import { getEvents } from "./lib/events";

export default async function Home() {
  const events = await getEvents();
  return (
    <div className="">
      <Hero/>
      <EventsSection events={events} />
      <AssociationSection
        image="/image_1.jpg"
        title="L'association"
        text="Voyages sonores immersifs, concerts à acoustique augmentée, performances spatialisées, soirées d’écoute multicanales, workshops immersifs et résidences artistiques."
        buttonText="Découvrir l'association"
        type="right"
      />
      <MidParagraph text="Nous unissons artistes, ingénieurs, institutions culturelles, festivals, laboratoires et écoles pour imaginer des expériences sonores qui repoussent les limites de l’écoute." />
      <AssociationSection
        image="/image_1.jpg"
        title="L'espace"
        text="MIAM a pour vocation de promouvoir la création et la diffusion de musiques immersives, de soutenir les innovations technomédiatiques et d’accompagner les artistes désireux d’inspirer un public varié."
        buttonText="Découvrir le lieu"
        type='left'
      />
      <MidParagraph text="Cet espace intime de partage de 100m2 se prête aussi bien à  l’émotion de l’écoute spatiale d’un ou plusieurs musiciens que l’écoute  active lors de diffusions d’oeuvres sonores multicanales." />
      <Partners />
    </div>
  );
}
