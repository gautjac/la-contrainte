import { disciplineById, type Discipline } from "./disciplines";

export interface Constraint {
  constraint: string;
  rationale: string;
  escalation: string;
  difficulty: number;
}

export interface DrawParams {
  discipline: Discipline;
  customLabel?: string; // for the "à toi" discipline
  intensityEn: string;
  durationEn: string;
  recent: string[];
}

// Reads the NDJSON stream from /api/draw: ignores heartbeat newlines, parses the
// final {result|error} line. Surfaces a clean error if the stream dies.
export async function drawConstraint(p: DrawParams): Promise<Constraint> {
  const isCustom = p.discipline.id === "custom";
  const label = isCustom && p.customLabel?.trim() ? p.customLabel.trim() : p.discipline.label;
  const brief =
    isCustom && p.customLabel?.trim()
      ? `A discipline the user named: "${p.customLabel.trim()}". Generate a constraint native to exactly this craft — read their wording closely.`
      : disciplineById(p.discipline.id).brief;

  const res = await fetch("/api/draw", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      disciplineId: p.discipline.id,
      disciplineLabel: label,
      disciplineBrief: brief,
      intensity: p.intensityEn,
      duration: p.durationEn,
      recent: p.recent,
    }),
  });

  if (!res.ok || !res.body) {
    let msg = `Erreur ${res.status}`;
    try {
      const data = await res.json();
      msg = (data as { error?: string }).error || msg;
    } catch {
      /* not json */
    }
    throw new Error(msg);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let last: { result?: Constraint; error?: string } | null = null;

  const consume = (chunk: string) => {
    buffer += chunk;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const t = line.trim();
      if (!t) continue; // heartbeat
      try {
        last = JSON.parse(t);
      } catch {
        /* partial / non-json line; ignore */
      }
    }
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    consume(decoder.decode(value, { stream: true }));
  }
  const tail = buffer.trim();
  if (tail) {
    try {
      last = JSON.parse(tail);
    } catch {
      /* ignore */
    }
  }

  if (!last) throw new Error("Le flux s'est interrompu sans réponse.");
  if (last.error) throw new Error(last.error);
  if (!last.result?.constraint) throw new Error("Réponse incomplète du modèle.");
  return last.result;
}
