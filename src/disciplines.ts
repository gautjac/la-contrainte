// The disciplines La Contrainte can boss you around in. Each carries a French
// label, a glyph, a colour, and a short brief that orients the generator toward
// what is genuinely generative in that medium (not gimmick).

export interface Discipline {
  id: string;
  label: string; // FR display
  en: string; // EN hint (used in the model prompt only)
  glyph: string;
  accent: string; // hex, for the tile
  brief: string; // EN, fed to the model so constraints fit the craft
}

export const DISCIPLINES: Discipline[] = [
  {
    id: "film",
    label: "Cinéma",
    en: "Film / cinematography / editing",
    glyph: "▷",
    accent: "#ff3b1d",
    brief:
      "Filmmaking: framing, blocking, light, sound, cutting, point of view, time. Generative constraints limit the means (one lens, no cuts, only reflections, sound first) to force discovery.",
  },
  {
    id: "music",
    label: "Musique",
    en: "Music composition / performance",
    glyph: "♪",
    accent: "#d8ff3e",
    brief:
      "Music: pitch, rhythm, harmony, timbre, silence, structure. Generative constraints strip resources (three notes, one chord, no melody, silence as material) so feeling must come from elsewhere.",
  },
  {
    id: "writing",
    label: "Écriture",
    en: "Writing / fiction / poetry / screenwriting",
    glyph: "✎",
    accent: "#3ec8ff",
    brief:
      "Writing: voice, POV, structure, what is said vs withheld, constraint on letters/words/time. True Oulipo territory — lipograms, forbidden words, scenes where no one says what they want.",
  },
  {
    id: "photo",
    label: "Photo",
    en: "Photography",
    glyph: "◉",
    accent: "#ff7a1a",
    brief:
      "Photography: frame, light, distance, time, the decisive moment. Generative constraints fix one variable hard (don't move your feet, one focal length, ten frames only, shoot only shadows).",
  },
  {
    id: "drawing",
    label: "Dessin",
    en: "Drawing / illustration / visual art",
    glyph: "✦",
    accent: "#9b7bff",
    brief:
      "Drawing / visual art: line, value, negative space, gesture, tool. Generative constraints limit the tool or the move (one continuous line, non-dominant hand, no lifting the pen, only triangles).",
  },
  {
    id: "custom",
    label: "À toi",
    en: "Custom discipline (user-defined)",
    glyph: "+",
    accent: "#f4f1e8",
    brief:
      "A discipline the user names themselves. Honour it precisely: read their wording and generate a constraint native to that craft, never a generic one.",
  },
];

export function disciplineById(id: string): Discipline {
  return DISCIPLINES.find((d) => d.id === id) ?? DISCIPLINES[0];
}

// Intensity dials how hard the constraint bites.
export interface Intensity {
  id: string;
  label: string;
  en: string;
  note: string; // FR microcopy
}

export const INTENSITIES: Intensity[] = [
  {
    id: "warmup",
    label: "Échauffement",
    en: "warm-up — a gentle but real limit, low stakes, quick win",
    note: "Une porte entrouverte.",
  },
  {
    id: "standard",
    label: "Standard",
    en: "standard — a sharp, specific constraint that asks for real work",
    note: "Le métier, droit devant.",
  },
  {
    id: "severe",
    label: "Sévère",
    en: "severe — an austere, demanding constraint that should scare you a little",
    note: "Ça va serrer.",
  },
];

// Duration is the window the user commits to.
export interface Duration {
  id: string;
  label: string;
  en: string;
  ms: number | null; // countdown length; null = open-ended (today / this week)
}

export const DURATIONS: Duration[] = [
  { id: "15min", label: "15 minutes", en: "15 minutes — one sitting", ms: 15 * 60 * 1000 },
  { id: "1h", label: "1 heure", en: "one hour — a focused block", ms: 60 * 60 * 1000 },
  { id: "today", label: "Aujourd'hui", en: "today — before the day ends", ms: null },
  { id: "week", label: "Cette semaine", en: "this week — a longer fuse", ms: null },
];

export function durationById(id: string): Duration {
  return DURATIONS.find((d) => d.id === id) ?? DURATIONS[1];
}
