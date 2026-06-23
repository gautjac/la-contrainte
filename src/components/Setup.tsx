import { useState } from "react";
import {
  DISCIPLINES,
  INTENSITIES,
  DURATIONS,
  type Discipline,
} from "../disciplines";

export interface DrawChoice {
  discipline: Discipline;
  customLabel: string;
  intensityId: string;
  durationId: string;
}

export function Setup({
  initial,
  busy,
  error,
  onDraw,
}: {
  initial: DrawChoice;
  busy: boolean;
  error: string | null;
  onDraw: (c: DrawChoice) => void;
}) {
  const [discipline, setDiscipline] = useState<Discipline>(initial.discipline);
  const [customLabel, setCustomLabel] = useState(initial.customLabel);
  const [intensityId, setIntensityId] = useState(initial.intensityId);
  const [durationId, setDurationId] = useState(initial.durationId);

  const isCustom = discipline.id === "custom";
  const customMissing = isCustom && !customLabel.trim();

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-6 pb-28 pt-2">
      {/* DISCIPLINE */}
      <section className="mb-9">
        <Heading n="01" accent="#ff3b1d">
          Discipline
        </Heading>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {DISCIPLINES.map((d) => {
            const on = d.id === discipline.id;
            return (
              <button
                key={d.id}
                onClick={() => setDiscipline(d)}
                aria-pressed={on}
                className={`group relative border-2 border-void p-4 text-left transition-all ${
                  on
                    ? "shadow-hard -translate-y-[1px]"
                    : "bg-void-soft hover:bg-void-line shadow-none"
                }`}
                style={on ? { background: d.accent, color: "#0d0d0f" } : { color: "#f4f1e8" }}
              >
                <div className="text-2xl mb-2 font-heavy" aria-hidden>
                  {d.glyph}
                </div>
                <div className="font-heavy uppercase text-sm tracking-wide">{d.label}</div>
              </button>
            );
          })}
        </div>

        {isCustom && (
          <div className="mt-3 animate-riseIn">
            <input
              autoFocus
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="Nomme ta discipline — danse, code, cuisine, sculpture…"
              className="w-full bg-void-soft border-2 border-void-line focus:border-bone px-4 py-3 font-body text-bone placeholder:text-bone-faint outline-none transition"
            />
          </div>
        )}
      </section>

      {/* INTENSITY */}
      <section className="mb-9">
        <Heading n="02" accent="#d8ff3e">
          Intensité
        </Heading>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {INTENSITIES.map((it) => {
            const on = it.id === intensityId;
            return (
              <button
                key={it.id}
                onClick={() => setIntensityId(it.id)}
                aria-pressed={on}
                className={`border-2 px-4 py-3 text-left transition-all ${
                  on
                    ? "border-volt bg-void-soft shadow-hard-sm"
                    : "border-void-line bg-void-soft hover:border-bone-faint"
                }`}
              >
                <div
                  className="font-heavy uppercase text-sm tracking-wide"
                  style={{ color: on ? "#d8ff3e" : "#f4f1e8" }}
                >
                  {it.label}
                </div>
                <div className="font-mono text-[11px] text-bone-faint mt-1">{it.note}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* DURATION */}
      <section className="mb-10">
        <Heading n="03" accent="#9b7bff">
          Fenêtre
        </Heading>
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map((d) => {
            const on = d.id === durationId;
            return (
              <button
                key={d.id}
                onClick={() => setDurationId(d.id)}
                aria-pressed={on}
                className={`border-2 px-4 py-2 font-mono text-sm uppercase tracking-wide transition-all ${
                  on
                    ? "border-crack text-void"
                    : "border-void-line text-bone-dim hover:border-bone-faint"
                }`}
                style={on ? { background: "#9b7bff" } : undefined}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </section>

      {error && (
        <div className="mb-5 border-2 border-dodged bg-void-soft px-4 py-3 font-mono text-sm text-dodged">
          {error}
        </div>
      )}

      <button
        disabled={busy || customMissing}
        onClick={() => onDraw({ discipline, customLabel, intensityId, durationId })}
        className="group relative w-full overflow-hidden border-2 border-void bg-signal text-void font-heavy uppercase text-xl sm:text-2xl tracking-wider py-5 shadow-hard disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:translate-x-[3px] enabled:hover:translate-y-[3px] enabled:hover:shadow-hard-sm transition-all"
      >
        {busy ? (
          <span className="inline-flex items-center gap-3">
            <span className="font-mono text-base normal-case tracking-normal">
              La Contrainte réfléchit
            </span>
            <Dots />
          </span>
        ) : (
          "Tire une contrainte"
        )}
        {busy && (
          <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-bone/30 blur-md animate-sweep" />
        )}
      </button>
      {customMissing && (
        <p className="mt-2 font-mono text-[11px] text-bone-faint text-center">
          Nomme ta discipline d'abord.
        </p>
      )}
    </div>
  );
}

function Heading({ n, accent, children }: { n: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3 mb-3">
      <span className="font-mono text-xs" style={{ color: accent }}>
        {n}
      </span>
      <h2 className="font-heavy uppercase text-sm tracking-[0.2em] text-bone">{children}</h2>
      <span className="flex-1 border-t border-void-line translate-y-[-2px]" />
    </div>
  );
}

function Dots() {
  return (
    <span className="inline-flex gap-1" aria-hidden>
      <span className="w-1.5 h-1.5 bg-void animate-pulseLine" style={{ animationDelay: "0ms" }} />
      <span className="w-1.5 h-1.5 bg-void animate-pulseLine" style={{ animationDelay: "150ms" }} />
      <span className="w-1.5 h-1.5 bg-void animate-pulseLine" style={{ animationDelay: "300ms" }} />
    </span>
  );
}
