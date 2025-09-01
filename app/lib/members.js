export async function getMembers() {
const items = [
{
id: "presidence",
name: "Alexandre Dupont",
role: "Président·e",
photo: "/images/members/president.jpg",
email: "alexandre@example.org",
website: "https://example.org",
},
{
id: "direction-artistique",
name: "Maya Rossi",
role: "Direction artistique",
photo: "/images/members/maya.jpg",
email: "maya@example.org",
},
{
id: "tresorerie",
name: "Nicolas Berthier",
role: "Trésorerie",
photo: "/images/members/nicolas.jpg",
},
{
id: "communication",
name: "Inès Martin",
role: "Communication",
photo: "/images/members/ines.jpg",
},
{
id: "production",
name: "Chiara Conti",
role: "Production",
photo: "/images/members/chiara.jpg",
},
{
id: "technique",
name: "Léo Steiner",
role: "Technique",
photo: "/images/members/leo.jpg",
},
];


// Tri alphabétique par nom (FR). Si tu veux un ordre custom, ajoute un champ "order" et trie dessus.
return items.sort((a, b) => a.name.localeCompare(b.name, "fr", { sensitivity: "base" }));
}