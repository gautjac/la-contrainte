import { useEffect, useState } from "react";
import type { Entry, Outcome } from "../db";
import { OUTCOMES } from "../outcomes";
import { formatCountdown } from "../time";
import { durationById } from "../disciplines";

function Difficulty({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-1" aria-label={`Difficulté ${n} sur 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="w-2.5 h-2.5"
          style={{ background: i <= n ? "#d8ff3e" : "rgba(244,241,232,0.18)" }}
        />
      ))}
    </span>
  );
}

// The charged state: a live challenge under a running clock. Visually distinct
// from the reflective logbook — voltage on black, big ticking time.
export function ActiveChallenge({
  entry,
  onResolve,
  onAbandonQuick,
}: {
  entry: Entry;
  onResolve: (outcome: Exclude<Outcome, null>, note: string) => void;
  onAbandonQuick: () => void;
}) {
  const [now, setNow] = useState(Date.now());
  const [chosen, setChosen] = useState<Exclude<Outcome, null> | null>(null);
  const [note, setNote] = useState("");

  const hasCountdown = entry.deadlineAt !== null;

  useEffect(() => {
    if (!hasCountdown) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [hasCountdown]);

  const msLeft = hasCountdown ? Math.max(0, (entry.deadlineAt as number) - now) : 0;
  const expired = hasCountdown && msLeft <= 0;
  const dur = durationById(entry.durationId);

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-6 pb-28 pt-2">
      {/* the clock / window banner */}
      <div className="border-2 border-volt bg-void-soft mb-4 animate-riseIn">
        <div className="flex items-center justify-between px-5 py-2 border-b border-volt/40">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-volt">
            Défi en cours
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-bone-faint">
            {entry.disciplineLabel}
          </span>
        </div>
        <div className="px-5 py-5 text-center">
          {hasCountdown ? (
            <>
              <div
                className={`font-display text-[clamp(3rem,16vw,6rem)] leading-none tabular-nums ${
                  expired ? "text-dodged" : "text-volt"
                }`}
              >
                {formatCountdown(msLeft)}
              </div>
              <div className="font-mono text-xs uppercase tracking-widest text-bone-faint mt-1">
                {expired ? "Le temps est écoulé. Rends des comptes." : "Il te reste ça."}
              </div>
            </>
          ) : (
            <>
              <div className="font-display uppercase text-[clamp(1.6rem,7vw,2.6rem)] leading-none text-volt">
                {dur.label}
              </div>
              <div className="font-mono text-xs uppercase tracking-widest text-bone-faint mt-2">
                Fenêtre ouverte — exécute, puis déclare.
              </div>
            </>
          )}
        </div>
      </div>

      {/* the constraint, restated as the standing order */}
      <div className="border-2 border-bone-line bg-void-soft px-6 sm:px-8 py-6 mb-5">
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-signal">
            L'ordre
          </span>
          <Difficulty n={entry.difficulty} />
        </div>
        <p className="font-heavy uppercase leading-[1.06] text-[clamp(1.4rem,4.8vw,2.2rem)] text-bone">
          {entry.constraint}
        </p>
        {entry.rationale && (
          <p className="font-body text-sm text-bone-dim mt-4 leading-snug border-t border-void-line pt-4">
            {entry.rationale}
          </p>
        )}
      </div>

      {/* outcome logging */}
      <div className="font-mono text-xs uppercase tracking-[0.2em] text-bone-faint mb-3">
        Rends des comptes
      </div>
      <div className="grid grid-cols-2 gap-3">
        {OUTCOMES.map((o) => {
          const on = chosen === o.id;
          return (
            <button
              key={o.id}
              onClick={() => setChosen(o.id)}
              aria-pressed={on}
              className={`border-2 px-4 py-4 text-left transition-all ${
                on ? "shadow-hard-sm -translate-y-[1px]" : "border-void-line hover:border-bone-faint"
              }`}
              style={
                on
                  ? { borderColor: o.color, background: o.color, color: "#0d0d0f" }
                  : { background: "#16161a" }
              }
            >
              <div
                className="font-heavy uppercase text-sm tracking-wide"
                style={{ color: on ? "#0d0d0f" : o.color }}
              >
                {o.label}
              </div>
              <div
                className="font-mono text-[10px] mt-1 leading-snug"
                style={{ color: on ? "rgba(13,13,15,0.7)" : "#8a8779" }}
              >
                {o.hint}
              </div>
            </button>
          );
        })}
      </div>

      {chosen && (
        <div className="mt-4 animate-riseIn">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Une note, une réflexion (optionnel). Qu'est-ce que ça a fait bouger ?"
            className="w-full bg-void-soft border-2 border-void-line focus:border-bone px-4 py-3 font-body text-bone placeholder:text-bone-faint outline-none resize-none transition"
          />
          <button
            onClick={() => onResolve(chosen, note.trim())}
            className="mt-3 w-full border-2 border-void bg-bone text-void font-heavy uppercase text-lg tracking-wider py-4 shadow-hard hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-hard-sm transition-all"
          >
            Sceller au carnet
          </button>
        </div>
      )}

      {!chosen && (
        <button
          onClick={onAbandonQuick}
          className="mt-5 mx-auto block font-mono text-[11px] uppercase tracking-widest text-bone-faint hover:text-dodged transition"
        >
          Tout lâcher
        </button>
      )}
    </div>
  );
}
