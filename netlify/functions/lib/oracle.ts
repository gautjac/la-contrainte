import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-4-8";

function client(): Anthropic {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error("Server missing CLAUDE_API_KEY");
  return new Anthropic({ apiKey, baseURL: "https://api.anthropic.com" });
}

export interface DrawRequest {
  disciplineId: string;
  disciplineLabel: string; // resolved label, incl. a custom one the user typed
  disciplineBrief: string; // EN craft brief
  intensity: string; // EN intensity spec
  duration: string; // EN duration spec
  recent: string[]; // recently drawn constraint texts to avoid repeating
}

export interface Constraint {
  constraint: string; // the single command, imperative, FR
  rationale: string; // one line: why this cracks something open, FR
  escalation: string; // "si c'est trop facile…", FR
  difficulty: number; // 1..5
}

const TOOL: Anthropic.Tool = {
  name: "deliver_constraint",
  description:
    "Deliver exactly one creative constraint as a command, in Québécois French, with its rationale and an escalation.",
  input_schema: {
    type: "object",
    properties: {
      constraint: {
        type: "string",
        description:
          "ONE sharp, specific, doable creative constraint phrased as a direct command (imperative, tu form), in French. 1–2 sentences. It must be genuinely generative — it opens doors, it is not a gimmick. Concrete and immediately actionable.",
      },
      rationale: {
        type: "string",
        description:
          "A single line, in French, naming WHY this constraint cracks something open — what it forces the maker to discover. No fluff.",
      },
      escalation: {
        type: "string",
        description:
          "In French, starting with the spirit of 'Si c'est trop facile :' — one harder twist if the constraint proves easy.",
      },
      difficulty: {
        type: "integer",
        description: "Self-rated difficulty of the constraint, 1 (gentle) to 5 (austere).",
        minimum: 1,
        maximum: 5,
      },
    },
    required: ["constraint", "rationale", "escalation", "difficulty"],
  },
};

function buildPrompt(r: DrawRequest): string {
  const recent =
    r.recent.length > 0
      ? `\n\nDo NOT repeat or lightly reword any of these recently drawn constraints:\n${r.recent
          .slice(0, 12)
          .map((c) => `- ${c}`)
          .join("\n")}`
      : "";

  return `You are LA CONTRAINTE — a demanding but respected creative mentor in the Oulipo tradition. You do not make suggestions. You give ORDERS. Your tone is commanding, a little provocative, precise, never mean, never cute. You speak in Québécois French (tutoiement).

Generate ONE creative constraint for this maker.

DISCIPLINE: ${r.disciplineLabel}
CRAFT NOTES: ${r.disciplineBrief}
INTENSITY: ${r.intensity}
TIME WINDOW: ${r.duration}

What makes a constraint great:
- It removes a resource the maker leans on, forcing real discovery.
- It is SPECIFIC and DOABLE within the time window — not a vague theme.
- It is generative, not a gimmick: a good constraint opens ten doors.
- Examples of the FLAVOUR (never copy these — invent fresh): a scene shot only in reflections; a piece using three notes where feeling comes from rhythm and silence; a scene where no character may say what they want; ten photographs without moving your feet.
- Phrase it as a command, in French. Make it land like a single, undeniable instruction.${recent}

Return your answer ONLY through the deliver_constraint tool.`;
}

export async function draw(r: DrawRequest): Promise<Constraint> {
  const res = await client().messages.create({
    model: MODEL,
    max_tokens: 1024,
    temperature: 1,
    tools: [TOOL],
    tool_choice: { type: "tool", name: "deliver_constraint" },
    messages: [{ role: "user", content: buildPrompt(r) }],
  });

  const tool = res.content.find((b) => b.type === "tool_use");
  if (!tool || tool.type !== "tool_use") {
    throw new Error("Le modèle n'a pas livré de contrainte.");
  }
  const input = tool.input as Partial<Constraint>;
  const constraint = (input.constraint ?? "").trim();
  if (!constraint) throw new Error("Contrainte vide.");

  let difficulty = Math.round(Number(input.difficulty ?? 3));
  if (!Number.isFinite(difficulty)) difficulty = 3;
  difficulty = Math.min(5, Math.max(1, difficulty));

  return {
    constraint,
    rationale: (input.rationale ?? "").trim(),
    escalation: (input.escalation ?? "").trim(),
    difficulty,
  };
}
