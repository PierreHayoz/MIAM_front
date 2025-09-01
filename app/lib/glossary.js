export async function getGlossary() {
  const items = [
    {
      slug: "son-3d",
      term: "Son 3D",
      definition: `Terme générique désignant les formats permettant d’enregistrer et de reproduire le son dans l’espace,
avec des quantités variables d’informations directionnelles selon la technologie. Exemples : Ambisonics, VBAP,
synthèse de champ d’ondes (WFS), Dolby Atmos (musique), son surround (5.1, 7.1, 9.1…), ou binaural (écoute au casque).`,
    },
    {
      slug: "musique-acousmatique",
      term: "Musique acousmatique",
      definition: `Fait référence à des œuvres diffusées exclusivement par haut‑parleurs : lors des concerts, les sources
sonores ne sont pas visibles ni identifiables. L’intention est souvent l’« écoute pure ». La musique acousmatique se
recoupe avec l’électroacoustique et s’inscrit dans le champ de la Neue Musik (New Music).`,
    },
    {
      slug: "musique-electroacoustique",
      term: "Musique électroacoustique",
      definition: `Terme collectif pour des compositions utilisant des sources sonores électroniques (la diffusion provient des haut‑parleurs).
Des sons acoustiques enregistrés (field recordings, instruments) peuvent aussi être intégrés. Les pièces sont souvent notées
(partitions, schémas). La musique électroacoustique appartient à la musique composée (New Music) — sans définition unique.`,
    },
    {
      slug: "arts-spatiaux",
      term: "Arts spatiaux",
      definition: `Pratiques artistiques qui intègrent explicitement l’espace et ses effets ; elles mobilisent généralement plus de deux
dimensions (déploiement dans la salle, trajectoires, hauteur, profondeur…).`,
    },
    {
      slug: "paysages-sonores",
      term: "Paysages sonores",
      definition: `Terme désignant le caractère acoustique d’un lieu ou environnement (par ex. un quartier, une forêt à un instant donné,
l’intérieur d’une voiture…). En art et en sound studies, les paysages sonores servent à explorer la relation entre l’activité
humaine et l’évolution des sons environnementaux.`,
    },
    {
      slug: "synthese-de-champ-d-ondes-wfs",
      term: "Synthèse de champ d’ondes (WFS)",
      definition: `Méthode de reproduction audio spatiale permettant de créer des environnements acoustiques virtuels ou de recréer
l’acoustique de pièces. Elle requiert un anneau (ou mur) de nombreux haut‑parleurs rapprochés ; on reproduit le plus souvent
le plan horizontal. L’image sonore reste stable quand l’auditeur se déplace et permet la localisation précise d’objets sonores.`,
    },
    {
      slug: "medias-fixes",
      term: "Médias fixes",
      definition: `Désigne un enregistrement (son) dont le format ne peut plus être modifié. En performance « fixe », les paramètres
(volume, réverbération, position spatiale, etc.) des pistes sonores ne sont plus ajustables.`,
    },
    {
      slug: "immersion",
      term: "Immersion",
      definition: `Du latin immersio : impression d’être plongé dans un autre monde et de perdre conscience de la réalité environnante.
Suscitée par la littérature, le cinéma, et surtout par les arts médiatiques/sonores, le jeu vidéo et la réalité virtuelle.
Elle est renforcée lorsque le public peut interagir et est entièrement entouré par l’environnement virtuel.`,
    },
    {
      slug: "ambisonics-ambisonie",
      term: "Ambisonics (ambisonie)",
      definition: `Méthode d’enregistrement et de reproduction spatiale du son qui encode l’ensemble des directions.
Pour chaque source, on calcule pression et vitesse du son pour chaque enceinte ; le positionnement est précis et
le décodage fonctionne avec un nombre variable d’enceintes.`,
    },
  ];

  // Tri alphabétique FR
  return items.sort((a, b) => a.term.localeCompare(b.term, "fr", { sensitivity: "base" }));
}