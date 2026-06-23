import type { Outcome } from "./db";

export interface OutcomeMeta {
  id: Exclude<Outcome, null>;
  label: string; // FR
  verb: string; // short stamp word
  color: string; // hex
  hint: string; // FR microcopy under the button
}

export const OUTCOMES: OutcomeMeta[] = [
  {
    id: "attempted",
    label: "Tenté",
    verb: "TENTÉ",
    color: "#3ec8ff",
    hint: "J'ai essayé. Pas fini, mais essayé.",
  },
  {
    id: "completed",
    label: "Accompli",
    verb: "ACCOMPLI",
    color: "#d8ff3e",
    hint: "C'est fait. Au complet.",
  },
  {
    id: "cracked",
    label: "Ça m'a ouvert",
    verb: "OUVERT",
    color: "#9b7bff",
    hint: "Quelque chose s'est ouvert. Je vois autrement.",
  },
  {
    id: "abandoned",
    label: "Abandonné",
    verb: "ABANDONNÉ",
    color: "#ff5b6e",
    hint: "J'ai lâché. C'est noté.",
  },
];

export function outcomeMeta(id: Outcome): OutcomeMeta | null {
  if (!id) return null;
  return OUTCOMES.find((o) => o.id === id) ?? null;
}
