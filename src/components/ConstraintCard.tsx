import type { Constraint } from "../api";
import { durationById } from "../disciplines";

function Difficulty({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-1" aria-label={`Difficulté ${n} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="w-2.5 h-2.5"
          style={{ background: i <= n ? "#0d0d0f" : "rgba(13,13,15,0.18)" }}
        />
      ))}
    </span>
  );
}

// The freshly-drawn constraint, presented like a command on a stark card.
export function ConstraintCard({
  constraint,
  disciplineLabel,
  durationId,
  onAccept,
  onReroll,
  rerolling,
}: {
  constraint: Constraint;
  disciplineLabel: string;
  durationId: string;
  onAccept: () => void;
  onReroll: () => void;
  rerolling: boolean;
}) {
  const dur = durationById(durationId);
  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-6 pb-28 pt-2">
      <div className="relative border-2 border-void bg-bone text-void shadow-hard-volt animate-riseIn">
        {/* header strip */}
        <div className="flex items-center justify-between border-b-2 border-void px-5 py-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em]">
            {disciplineLabel} · {dur.label}
          </span>
          <Difficulty n={constraint.difficulty} />
        </div>

        {/* the command */}
        <div className="px-6 sm:px-8 py-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-signal mb-4">
            La contrainte
          </div>
          <p className="font-heavy uppercase leading-[1.04] text-[clamp(1.6rem,5.5vw,2.7rem)]">
            {constraint.constraint}
          </p>
        </div>

        {/* rationale */}
        {constraint.rationale && (
          <div className="border-t-2 border-void px-6 sm:px-8 py-5 hatch">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-void/60 mb-1">
              Pourquoi ça ouvre
            </div>
            <p className="font-body text-base leading-snug">{constraint.rationale}</p>
          </div>
        )}

        {/* escalation */}
        {constraint.escalation && (
          <details className="border-t-2 border-void group">
            <summary className="cursor-pointer list-none px-6 sm:px-8 py-3 font-mono text-xs uppercase tracking-widest flex items-center justify-between hover:bg-void/5">
              <span>Si c'est trop facile</span>
              <span className="transition-transform group-open:rotate-45 text-lg leading-none">+</span>
            </summary>
            <p className="px-6 sm:px-8 pb-5 font-body text-base leading-snug text-void/85">
              {constraint.escalation}
            </p>
          </details>
        )}
      </div>

      {/* actions */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
        <button
          onClick={onAccept}
          className="border-2 border-void bg-volt text-void font-heavy uppercase text-lg tracking-wider py-4 shadow-hard hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-hard-sm transition-all"
        >
          J'accepte
        </button>
        <button
          onClick={onReroll}
          disabled={rerolling}
          className="border-2 border-void-line text-bone-dim font-mono uppercase text-sm tracking-widest px-6 py-4 hover:border-bone hover:text-bone disabled:opacity-50 transition-all"
        >
          {rerolling ? "…" : "Relancer"}
        </button>
      </div>
      <p className="mt-3 font-mono text-[11px] text-bone-faint text-center">
        Relancer est noté. La Contrainte voit qui esquive.
      </p>
    </div>
  );
}
