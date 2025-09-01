// file: app/lib/events-utils.js

const TIMEZONE = "Europe/Zurich";

// Date en timezone locale (retourne un Date UTC correspondant au local time demandé)
export function dateInTimeZone({ timeZone = TIMEZONE, year, month, day, hour = 0, minute = 0, second = 0 }) {
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
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
  const parts = Object.fromEntries(fmt.formatToParts(utcDate).map((p) => [p.type, p.value]));
  const asUTC = Date.UTC(
    Number(parts.year), Number(parts.month) - 1, Number(parts.day),
    Number(parts.hour), Number(parts.minute), Number(parts.second)
  );
  return new Date(asUTC);
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

export function formatEventDateRange(e, locale = "fr-CH", timeZone = TIMEZONE) {
  const start = getEventStartDate(e);
  const end = getEventEndDate(e) || start;
  if (!start && !end) return "";
  const fmt = new Intl.DateTimeFormat(locale, { timeZone, day: "2-digit", month: "short", year: "numeric" });
  const same = start && end && start.toDateString() === end.toDateString();
  return same ? fmt.format(start || end) : `${fmt.format(start)} → ${fmt.format(end)}`;
}

