import { useEffect, useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  db,
  addEntry,
  updateEntry,
  deleteEntry,
  type Entry,
  type Outcome,
} from "./db";
import {
  DISCIPLINES,
  INTENSITIES,
  DURATIONS,
  durationById,
} from "./disciplines";
import { drawConstraint, type Constraint } from "./api";
import { recentTexts } from "./stats";
import { Onboarding } from "./components/Onboarding";
import { Setup, type DrawChoice } from "./components/Setup";
import { ConstraintCard } from "./components/ConstraintCard";
import { ActiveChallenge } from "./components/ActiveChallenge";
import { Logbook } from "./components/Logbook";

const ONBOARD_KEY = "la-contrainte:onboarded";

type View = "atelier" | "carnet";
type Stage =
  | { kind: "setup" }
  | { kind: "drawn"; constraint: Constraint; choice: DrawChoice; rerolledFrom: number | null }
  | { kind: "active"; entryId: number };

export default function App() {
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem(ONBOARD_KEY) === "1");
  const [view, setView] = useState<View>("atelier");
  const [stage, setStage] = useState<Stage>({ kind: "setup" });
  const [busy, setBusy] = useState(false);
  const [rerolling, setRerolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [choice, setChoice] = useState<DrawChoice>({
    discipline: DISCIPLINES[0],
    customLabel: "",
    intensityId: INTENSITIES[1].id,
    durationId: DURATIONS[0].id,
  });

  const entries = useLiveQuery(() => db.entries.toArray(), [], [] as Entry[]) ?? [];
  const activeEntry = useMemo(
    () => (stage.kind === "active" ? entries.find((e) => e.id === stage.entryId) ?? null : null),
    [stage, entries],
  );

  // On load, resume the most recent open challenge (accepted, unresolved).
  useEffect(() => {
    if (!onboarded) return;
    if (stage.kind !== "setup") return;
    const open = [...entries]
      .filter((e) => e.acceptedAt !== null && e.outcome === null)
      .sort((a, b) => (b.acceptedAt as number) - (a.acceptedAt as number))[0];
    if (open?.id != null) {
      setStage({ kind: "active", entryId: open.id });
      setView("atelier");
    }
    // run once entries first hydrate
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboarded, entries.length]);

  function finishOnboarding() {
    localStorage.setItem(ONBOARD_KEY, "1");
    setOnboarded(true);
  }

  function intensityEn(id: string): string {
    return INTENSITIES.find((i) => i.id === id)?.en ?? INTENSITIES[1].en;
  }
  function durationEn(id: string): string {
    return DURATIONS.find((d) => d.id === id)?.en ?? DURATIONS[0].en;
  }

  async function runDraw(c: DrawChoice, rerolledFrom: number | null) {
    setError(null);
    const setLoading = rerolledFrom != null ? setRerolling : setBusy;
    setLoading(true);
    try {
      const constraint = await drawConstraint({
        discipline: c.discipline,
        customLabel: c.customLabel,
        intensityEn: intensityEn(c.intensityId),
        durationEn: durationEn(c.durationId),
        recent: recentTexts(entries),
      });
      setChoice(c);
      setStage({ kind: "drawn", constraint, choice: c, rerolledFrom });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec du tirage. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  function resolvedLabel(c: DrawChoice): string {
    if (c.discipline.id === "custom" && c.customLabel.trim()) return c.customLabel.trim();
    return c.discipline.label;
  }

  // Reroll: record the dodged draw to the logbook (untouched, flagged), then draw anew.
  async function handleReroll() {
    if (stage.kind !== "drawn") return;
    const { constraint, choice: c } = stage;
    const id = await addEntry({
      constraint: constraint.constraint,
      rationale: constraint.rationale,
      escalation: constraint.escalation,
      difficulty: constraint.difficulty,
      disciplineId: c.discipline.id,
      disciplineLabel: resolvedLabel(c),
      intensityId: c.intensityId,
      durationId: c.durationId,
      durationMs: durationById(c.durationId).ms,
      drawnAt: Date.now(),
      acceptedAt: null,
      deadlineAt: null,
      resolvedAt: null,
      outcome: null,
      note: "",
      rerolledFrom: stage.rerolledFrom,
      wasReroll: stage.rerolledFrom !== null,
    });
    await runDraw(c, id);
  }

  async function handleAccept() {
    if (stage.kind !== "drawn") return;
    const { constraint, choice: c } = stage;
    const now = Date.now();
    const ms = durationById(c.durationId).ms;
    const id = await addEntry({
      constraint: constraint.constraint,
      rationale: constraint.rationale,
      escalation: constraint.escalation,
      difficulty: constraint.difficulty,
      disciplineId: c.discipline.id,
      disciplineLabel: resolvedLabel(c),
      intensityId: c.intensityId,
      durationId: c.durationId,
      durationMs: ms,
      drawnAt: now,
      acceptedAt: now,
      deadlineAt: ms != null ? now + ms : null,
      resolvedAt: null,
      outcome: null,
      note: "",
      rerolledFrom: stage.rerolledFrom,
      wasReroll: stage.rerolledFrom !== null,
    });
    setStage({ kind: "active", entryId: id });
  }

  async function handleResolve(outcome: Exclude<Outcome, null>, note: string) {
    if (stage.kind !== "active") return;
    await updateEntry(stage.entryId, { outcome, note, resolvedAt: Date.now() });
    setStage({ kind: "setup" });
    setView("carnet");
  }

  async function handleAbandonQuick() {
    if (stage.kind !== "active") return;
    await updateEntry(stage.entryId, {
      outcome: "abandoned",
      resolvedAt: Date.now(),
    });
    setStage({ kind: "setup" });
    setView("carnet");
  }

  function resumeFromLog(e: Entry) {
    if (e.id == null) return;
    if (e.acceptedAt === null) {
      // untouched draw → accept it now (fresh window from now)
      const now = Date.now();
      const ms = e.durationMs;
      updateEntry(e.id, { acceptedAt: now, deadlineAt: ms != null ? now + ms : null }).then(() => {
        setStage({ kind: "active", entryId: e.id as number });
        setView("atelier");
      });
    } else {
      setStage({ kind: "active", entryId: e.id });
      setView("atelier");
    }
  }

  if (!onboarded) return <Onboarding onDone={finishOnboarding} />;

  return (
    <div className="bg-desk min-h-screen flex flex-col">
      <Header
        view={view}
        onView={(v) => {
          setView(v);
          if (v === "atelier" && stage.kind === "drawn") {
            // keep the drawn card
          }
        }}
        openCount={entries.filter((e) => e.acceptedAt !== null && e.outcome === null).length}
      />

      <main className="flex-1 w-full">
        {view === "carnet" ? (
          <Logbook
            entries={entries}
            onDelete={(id) => void deleteEntry(id)}
            onResume={resumeFromLog}
            onStart={() => {
              setView("atelier");
              setStage({ kind: "setup" });
            }}
          />
        ) : stage.kind === "active" && activeEntry ? (
          <ActiveChallenge
            entry={activeEntry}
            onResolve={handleResolve}
            onAbandonQuick={handleAbandonQuick}
          />
        ) : stage.kind === "drawn" ? (
          <ConstraintCard
            constraint={stage.constraint}
            disciplineLabel={resolvedLabel(stage.choice)}
            durationId={stage.choice.durationId}
            onAccept={handleAccept}
            onReroll={handleReroll}
            rerolling={rerolling}
          />
        ) : (
          <Setup
            initial={choice}
            busy={busy}
            error={error}
            onDraw={(c) => void runDraw(c, null)}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

function Header({
  view,
  onView,
  openCount,
}: {
  view: View;
  onView: (v: View) => void;
  openCount: number;
}) {
  return (
    <header className="sticky top-0 z-20 border-b-2 border-void-line bg-void/90 backdrop-blur supports-[backdrop-filter]:bg-void/75">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
        <button onClick={() => onView("atelier")} className="text-left group">
          <div className="font-display uppercase text-2xl sm:text-3xl leading-none tracking-tight text-bone">
            La Con<span className="text-signal">trainte</span>
          </div>
          <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-bone-faint group-hover:text-bone transition">
            des ordres, pas des suggestions
          </div>
        </button>
        <nav className="flex items-center gap-1">
          <Tab active={view === "atelier"} onClick={() => onView("atelier")}>
            Atelier
          </Tab>
          <Tab active={view === "carnet"} onClick={() => onView("carnet")} badge={openCount}>
            Le carnet
          </Tab>
        </nav>
      </div>
    </header>
  );
}

function Tab({
  active,
  onClick,
  children,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative font-mono text-xs uppercase tracking-widest px-3 py-2 border-2 transition ${
        active
          ? "border-bone text-void bg-bone"
          : "border-transparent text-bone-faint hover:text-bone"
      }`}
    >
      {children}
      {badge != null && badge > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-ember text-void font-mono text-[10px] leading-none">
          {badge}
        </span>
      )}
    </button>
  );
}

function Footer() {
  return (
    <footer className="border-t-2 border-void-line">
      <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-void-mute">
          Atelier · local-first
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-void-mute">
          Oulipo ⌁
        </span>
      </div>
    </footer>
  );
}
