import Link from 'next/link';
import Card from '../cards/Card';
import Buttons from '../button/Buttons';
import Paragraphs from '../paragraphs/Paragraphs';

const EventsSection = ({ events }) => {
    // Date actuelle
    const now = new Date();

    // Filtrer + trier les events par date
    const upcomingEvents = (events || [])
        .filter(event => new Date(event.startDate) >= now) // uniquement futurs
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate)) // tri ascendant
        .slice(0, 4); // garder seulement les 3 premiers

    return (
        <div className="grid grid-cols-4 px-4">
            <div className="col-span-1  pr-4">
                <Paragraphs title="À venir" text="Cet espace intime de partage de 10m sur 10m se prête aussi bien à l’émotion de l’écoute spatiale d’un ou plusieurs musiciens que l’écoute active lors de diffusions d’oeuvres sonores multicanales. "/>
            </div> 
            <div className="col-span-2 grid grid-cols-2">
            {upcomingEvents.map((event) => (
                <Card
                    type="row"
                    key={event.id}
                    {...event}
                />
            ))}
            </div>
            <Buttons url={"/event"} text="Découvrir le programme"/>
        </div>
    );
};

export default EventsSection;
