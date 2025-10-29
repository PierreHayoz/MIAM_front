// file: app/lib/events-utils.js

const TIMEZONE = "Europe/Zurich";
export function i18nLocale(locale) {
  const l = String(locale || "fr").toLowerCase();
  if (l.startsWith("fr")) return "fr-CH";
  if (l.startsWith("de")) return "de-CH";
  if (l.startsWith("it")) return "it-CH";
  if (l.startsWith("en")) return "en-GB";
  return "fr-CH";
}
// Date en timezone locale (retourne un Date UTC correspondant au local time demandé)
export function dateInTimeZone({ timeZone = TIMEZONE, year, month, day, hour = 0, minute = 0, second = 0 }) {
  const asIfUTC = Date.UTC(year, month - 1, day, hour, minute, second);
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(new Date(asIfUTC)).map((p) => [p.type, p.value])
  );
  const projected = Date.UTC(
    Number(parts.year), Number(parts.month) - 1, Number(parts.day),
    Number(parts.hour), Number(parts.minute), Number(parts.second)
  );
  const offsetMs = projected - asIfUTC;
  // on le RETIRE pour obtenir l’instant UTC correct
  return new Date(asIfUTC - offsetMs);
}

// Parse "YYYY-MM-DD" + "HH:mm" en Europe/Zurich
function parseDateAndTimeLocal(dateStr, timeStr, { endOfDay = false, timeZone = TIMEZONE } = {}) {
  if (!dateStr) return null;
  const [y, m, d] = String(dateStr).split("-").map(Number);
  let hh = 0, mm = 0, ss = 0;
  if (timeStr) {
    const [h, min, s] = String(timeStr).split(":").map((n) => Number(n ?? 0));
    hh = h || 0; mm = min || 0; ss = s || 0;
  } else if (endOfDay) {
    hh = 23; mm = 59; ss = 59;
  }
  return dateInTimeZone({ timeZone, year: y, month: m, day: d, hour: hh, minute: mm, second: ss });
}

// --- Dates début/fin tolérantes aux différents schémas ----------------------
export function getEventStartDate(e) {
  // ISO complets
  if (e?.startAt) return new Date(e.startAt);
  if (e?.start_at) return new Date(e.start_at);
  // Date + heure séparées (ton exemple)
  if (e?.startDate) return parseDateAndTimeLocal(e.startDate, e.startTime);
  // Date seule
  if (e?.date) return parseDateAndTimeLocal(e.date, null, { endOfDay: false });
  return null;
}

export function getEventEndDate(e) {
  if (e?.endAt) return new Date(e.endAt);
  if (e?.end_at) return new Date(e.end_at);
  if (e?.endDate) return parseDateAndTimeLocal(e.endDate, e.endTime, { endOfDay: !e?.endTime });
  // si pas de fin, on se rabat sur le début
  const start = getEventStartDate(e);
  if (start) return start;
  if (e?.date) return parseDateAndTimeLocal(e.date, null, { endOfDay: true });
  return null;
}

// --- Classement -------------------------------------------------------------
export function isPastEvent(e, now = new Date()) {
  const end = getEventEndDate(e) || getEventStartDate(e);
  return end ? end.getTime() < now.getTime() : false;
}

export function splitEventsByTime(events, now = new Date()) {
  const upcoming = [], past = [];
  for (const ev of events || []) (isPastEvent(ev, now) ? past : upcoming).push(ev);
  const startTs = (ev) => getEventStartDate(ev)?.getTime() ?? 0;
  const endTs = (ev) => (getEventEndDate(ev) || getEventStartDate(ev))?.getTime() ?? 0;
  upcoming.sort((a, b) => startTs(a) - startTs(b));
  past.sort((a, b) => endTs(b) - endTs(a));
  return { upcoming, past };
}

export function groupByYear(events, by = "end") {
  const getD = by === "start" ? getEventStartDate : (e) => getEventEndDate(e) || getEventStartDate(e);
  return (events || []).reduce((acc, e) => {
    const dt = getD(e);
    const y = dt ? String(dt.getUTCFullYear()) : "Sans date";
    (acc[y] ||= []).push(e);
    return acc;
  }, {});
}

// --- Helpers d'affichage ----------------------------------------------------
export function eventKey(e) { return e.slug ?? e.id ?? `${e.title}-${e.startDate ?? e.date ?? Math.random()}`; }
export function eventHref(e) { return e.slug || e.id ? `/programme/${e.slug ?? e.id}` : undefined; }
export function eventThumb(e) { return e.thumbnail ?? e.image ?? null; }

function normalizeTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.filter(Boolean).map(String);
  if (typeof tags === "string") return tags.split(/[;,#]/).map((t) => t.trim()).filter(Boolean);
  return [];
}
export function eventTags(e) { return normalizeTags(e.tags ?? e.tag ?? e.categories ?? e.labels ?? e.keywords); }
function ymdInTZ(d, timeZone = TIMEZONE) {
  // "YYYY-MM-DD" en timeZone cible
  return new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit"
  }).format(d);
}

export function formatEventDateRange(e, locale = "fr-CH", timeZone = TIMEZONE) {
  const loc = i18nLocale(locale); const start = getEventStartDate(e);
  const end = getEventEndDate(e) || start;
  if (!start && !end) return "";
   const fmt = new Intl.DateTimeFormat(loc, { timeZone, day: "2-digit", month: "short", year: "numeric" });  const same = start && end && ymdInTZ(start, timeZone) === ymdInTZ(end, timeZone);
  return same ? fmt.format(start || end) : `${fmt.format(start)} → ${fmt.format(end)}`;
}

// --- Heures / portes : helpers d'affichage cohérents page & cards ---------
export function timeDisplay(value, locale = "fr-CH", timeZone = TIMEZONE) {
    const loc = i18nLocale(locale);  if (!value) return null;
  // déjà "HH:mm"
  if (typeof value === "string" && /^\d{1,2}:\d{2}$/.test(value)) return value;
  // ISO/Date → HH:mm (Europe/Zurich)
  try {
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
       return d.toLocaleTimeString(loc, { hour: "2-digit", minute: "2-digit", timeZone });    }
  } catch { }
  return null;
}

export function formatDoorOpeningDisplay(door, locale = "fr-CH", timeZone = TIMEZONE) {
    const loc = i18nLocale(locale);  if (!door) return null;
  // string "HH:mm"
  if (typeof door === "string" && /^\d{1,2}:\d{2}$/.test(door)) return door;
  // objet normalisé { time, iso, raw, ... }
  if (typeof door === "object") {
    if (typeof door.time === "string" && /^\d{1,2}:\d{2}$/.test(door.time)) return door.time;
    const iso = door.iso || (typeof door.raw === "string" && door.raw.includes("T") ? door.raw : null);
    if (iso) {
      try {
        return new Date(iso).toLocaleTimeString(loc, { hour: "2-digit", minute: "2-digit", timeZone });      } catch { }
    }
  }
  return null;
}

// Affiche "porte → fin" si possible, sinon l’un des deux, sinon null
export function formatDoorToEndRange(e, locale = "fr-CH", timeZone = TIMEZONE) {
  const door = formatDoorOpeningDisplay(e?.doorOpening, locale, timeZone);
  const end = timeDisplay(e?.endTime, locale, timeZone);
  if (door && end) return `${door} – ${end}`;
  return door || end || null;
}
