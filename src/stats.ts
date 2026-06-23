import type { Entry } from "./db";

export interface Stats {
  total: number; // constraints drawn
  attempts: number; // attempted + completed + cracked
  completed: number;
  cracked: number;
  abandoned: number;
  attemptedOnly: number;
  resolved: number; // any outcome logged
  open: number; // accepted, no outcome yet
  untouched: number; // drawn, never accepted (the dodge pile)
  rerolls: number;
  attemptRate: number; // attempts / total, 0..1
  streak: number; // consecutive days with at least one attempt/completion/crack
}

const DAY = 24 * 60 * 60 * 1000;

function dayKey(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function computeStats(entries: Entry[]): Stats {
  const total = entries.length;
  const completed = entries.filter((e) => e.outcome === "completed").length;
  const cracked = entries.filter((e) => e.outcome === "cracked").length;
  const abandoned = entries.filter((e) => e.outcome === "abandoned").length;
  const attemptedOnly = entries.filter((e) => e.outcome === "attempted").length;
  const attempts = completed + cracked + attemptedOnly;
  const resolved = entries.filter((e) => e.outcome !== null).length;
  const open = entries.filter((e) => e.acceptedAt !== null && e.outcome === null).length;
  const untouched = entries.filter((e) => e.acceptedAt === null && e.outcome === null).length;
  const rerolls = entries.filter((e) => e.wasReroll).length;
  const attemptRate = total > 0 ? attempts / total : 0;

  // Streak: count back from today over days that have at least one genuine effort
  // (attempted / completed / cracked), keyed by resolvedAt.
  const effortDays = new Set<number>();
  for (const e of entries) {
    if ((e.outcome === "attempted" || e.outcome === "completed" || e.outcome === "cracked") && e.resolvedAt) {
      effortDays.add(dayKey(e.resolvedAt));
    }
  }
  let streak = 0;
  if (effortDays.size > 0) {
    const today = dayKey(Date.now());
    // allow the streak to start today or yesterday (grace)
    let cursor = effortDays.has(today) ? today : today - DAY;
    while (effortDays.has(cursor)) {
      streak += 1;
      cursor -= DAY;
    }
  }

  return {
    total,
    attempts,
    completed,
    cracked,
    abandoned,
    attemptedOnly,
    resolved,
    open,
    untouched,
    rerolls,
    attemptRate,
    streak,
  };
}

// Recent constraint texts to feed the generator so it doesn't repeat itself.
export function recentTexts(entries: Entry[], n = 12): string[] {
  return [...entries]
    .sort((a, b) => b.drawnAt - a.drawnAt)
    .slice(0, n)
    .map((e) => e.constraint);
}
