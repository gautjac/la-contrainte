import Dexie, { type Table } from "dexie";

// Every constraint ever drawn is a logbook entry. The app's spine: it remembers
// what it ordered you to do and whether you did it. No dodging in the dark.

export type Outcome = "attempted" | "completed" | "cracked" | "abandoned" | null;
// null = drawn but not yet resolved (an open challenge or an untouched draw)

export interface Entry {
  id?: number;
  // the constraint itself
  constraint: string;
  rationale: string;
  escalation: string;
  difficulty: number; // 1..5, the model's self-rating
  // context it was drawn under
  disciplineId: string;
  disciplineLabel: string; // resolved label (handles custom)
  intensityId: string;
  durationId: string;
  durationMs: number | null; // committed window length at accept time
  // lifecycle
  drawnAt: number; // when generated
  acceptedAt: number | null; // when the user committed (challenge started)
  deadlineAt: number | null; // acceptedAt + durationMs (countdown only)
  resolvedAt: number | null; // when an outcome was logged
  outcome: Outcome;
  note: string; // optional reflection
  rerolledFrom: number | null; // entry id this was rerolled away from
  wasReroll: boolean; // true if this draw replaced a previous unaccepted one
}

class ContrainteDB extends Dexie {
  entries!: Table<Entry, number>;

  constructor() {
    super("la-contrainte");
    this.version(1).stores({
      entries: "++id, drawnAt, acceptedAt, resolvedAt, outcome, disciplineId",
    });
  }
}

export const db = new ContrainteDB();

export async function addEntry(e: Omit<Entry, "id">): Promise<number> {
  return db.entries.add(e as Entry);
}

export async function updateEntry(id: number, patch: Partial<Entry>): Promise<void> {
  await db.entries.update(id, patch);
}

export async function deleteEntry(id: number): Promise<void> {
  await db.entries.delete(id);
}

export async function getEntry(id: number): Promise<Entry | undefined> {
  return db.entries.get(id);
}
