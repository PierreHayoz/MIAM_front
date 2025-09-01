// scripts/seed-events.mjs
// Node 18+ (fetch global). Crée N events dans Strapi v4 via l'API REST.

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || "716d4b5b4da50d8706041be50691c3e945b421ade73b9aea5efdcefed6d8e60c693c1778c6db136ffb0cd22614ef2e2560240afaef482bd5a7f70ce8ba18bc696ebe5d231c86962a0d3b4df5ad1c025d7801932413b9f48b2f7447c555c8755377909b47fac64610604c43233369f504ad80f0cf5516f81278d3c2d677ad53d0"; // API Token (type: Full access ou avec perms create)
const COUNT = Number(process.env.COUNT || 15);
const LOCALE = process.env.LOCALE || "fr";

// Optionnel: liste d'IDs de catégories à associer (ex: "1,2,3")
const CATEGORY_IDS = (process.env.CATEGORY_IDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)
  .map((n) => Number(n));

if (!STRAPI_TOKEN) {
  console.error("❌ STRAPI_TOKEN manquant (env).");
  process.exit(1);
}

const rnd = (seed = 42) => {
  // petit PRNG déterministe pour des données stables
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
};

const pick = (arr, r) => arr[Math.floor(r() * arr.length)];

const pad2 = (n) => String(n).padStart(2, "0");

const fmtDate = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const fmtTime = (h, m = 0) => `${pad2(h)}:${pad2(m)}:00`;

/**
 * Génère une plage de dates autour de "maintenant" (passé & futur),
 * avec parfois endDate==startDate.
 */
function genDates(r) {
  // -200 à +90 jours autour d'aujourd'hui
  const offsetStart = Math.floor(r() * 290) - 200;
  const start = new Date();
  start.setHours(12, 0, 0, 0);
  start.setDate(start.getDate() + offsetStart);

  let end = new Date(start);
  if (r() > 0.4) {
    const dur = 1 + Math.floor(r() * 3); // 1 à 3 jours
    end.setDate(start.getDate() + dur);
  }
  const startDate = fmtDate(start);
  const endDate = end ? fmtDate(end) : null;

  // Horaires simples
  // ✅ après
  const startTime = fmtTime(pick([18, 19, 20], r), pick([0, 30], r));
  const endTime = fmtTime(pick([21, 22, 23], r), pick([0, 30], r));

  return { startDate, endDate, startTime, endTime };
}

function genTitle(i, r) {
  const themes = [
    "Concert",
    "Expo",
    "Projection",
    "Atelier",
    "Performance",
    "Rencontre",
    "Conférence",
  ];
  const tags = ["MIAM", "Nuit", "Studio", "Quartier", "Édition", "Saison", "Club"];
  return `${pick(themes, r)} ${pick(tags, r)} #${i + 1}`;
}

function genPrice(r) {
  const prices = ["CHF 10.–", "CHF 12.–", "CHF 15.–", "CHF 20.–"];
  return pick(prices, r);
}

function sampleCategoryIds(r) {
  if (!CATEGORY_IDS.length) return undefined;
  // échantillon 0-3 ids aléatoires (sans doublon)
  const n = Math.floor(r() * Math.min(3, CATEGORY_IDS.length + 1));
  const shuffled = [...CATEGORY_IDS].sort(() => r() - 0.5);
  return shuffled.slice(0, n);
}

function buildBody(i, r) {
  const title = genTitle(i, r);
  const isFree = r() < 0.4; // ~40% gratuits
  const isKidsFriendly = r() < 0.3; // ~30% kids
  const { startDate, endDate, startTime, endTime } = genDates(r);

  // On laisse "slug" vide (Strapi UID générera depuis title).
  // Les champs "blocks" sont JSON — on peut les laisser vides.
  // Si l’entry doit être publiée à la création:
  const publishedAt = new Date().toISOString();

  const data = {
    locale: LOCALE,
    title,
    isFree,
    isKidsFriendly,
    startDate,
    endDate,
    startTime,
    endTime,
    description: [], // type "blocks" — vide si tu préfères
    content: [],     // type "blocks" — vide si tu préfères
    // cover: null,   // media: on laisse vide; sinon, upload séparé
    // gallery: [],   // component repeatable: idem, on laisse vide
    publishedAt,
  };

  if (!isFree) {
    data.price = genPrice(r);
    data.ticket_url = "https://example.com/tickets";
  }

  const cats = sampleCategoryIds(r);
  if (cats && cats.length) {
    data.event_categories = cats;
  }

  return { data };
}

async function createEvent(payload) {
  const res = await fetch(`${STRAPI_URL}/api/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} – ${res.statusText}\n${txt}`);
  }
  return res.json();
}

async function main() {
  console.log(`➡️  Seeding ${COUNT} events on ${STRAPI_URL} (locale=${LOCALE})`);
  const r = rnd(20250902); // seed stable

  for (let i = 0; i < COUNT; i++) {
    const payload = buildBody(i, r);
    try {
      const { data } = await createEvent(payload);
      console.log(`✅ Created #${i + 1} id=${data?.id} title="${data?.attributes?.title}"`);
    } catch (err) {
      console.error(`❌ Failed #${i + 1}:`, err.message);
      process.exitCode = 1;
    }
  }

  console.log("🏁 Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
