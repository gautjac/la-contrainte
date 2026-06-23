// Small French time helpers for the countdown and the logbook.

export function formatCountdown(msLeft: number): string {
  if (msLeft <= 0) return "00:00";
  const totalSec = Math.floor(msLeft / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const MONTHS = [
  "janv.",
  "févr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juill.",
  "août",
  "sept.",
  "oct.",
  "nov.",
  "déc.",
];

export function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function relativeFromNow(ts: number): string {
  const diff = Date.now() - ts;
  const day = 24 * 60 * 60 * 1000;
  if (diff < 60 * 1000) return "à l'instant";
  if (diff < 60 * 60 * 1000) return `il y a ${Math.floor(diff / (60 * 1000))} min`;
  if (diff < day) return `il y a ${Math.floor(diff / (60 * 60 * 1000))} h`;
  const days = Math.floor(diff / day);
  if (days === 1) return "hier";
  if (days < 7) return `il y a ${days} jours`;
  return formatDate(ts);
}
