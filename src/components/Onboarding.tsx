import { useState } from "react";

const PANELS = [
  {
    kicker: "01 — Ce que c'est",
    title: "Je te donne des ORDRES.",
    body: "Pas des suggestions. Pas des idées gentilles. Une contrainte créative, nette et précise, taillée pour ta discipline. À la Oulipo : enlève une ressource, et regarde ce qui s'ouvre.",
    accent: "#ff3b1d",
  },
  {
    kicker: "02 — Le marché",
    title: "Tu acceptes. Tu fais. Tu rends des comptes.",
    body: "Quand tu acceptes une contrainte, le chrono part. Ensuite tu déclares : tenté, accompli, ça m'a ouvert, ou abandonné. Honnête.",
    accent: "#d8ff3e",
  },
  {
    kicker: "03 — Je tiens le carnet",
    title: "Je note tout. Même tes esquives.",
    body: "Chaque contrainte tirée reste au carnet. Celles que tu as faites. Celles que tu as fuies. Les relances comptent aussi. Pas d'esquive dans le noir.",
    accent: "#9b7bff",
  },
];

export function Onboarding({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const panel = PANELS[i];
  const last = i === PANELS.length - 1;

  return (
    <div className="bg-desk min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl animate-riseIn" key={i}>
          <div
            className="font-mono text-xs tracking-[0.3em] uppercase mb-6"
            style={{ color: panel.accent }}
          >
            {panel.kicker}
          </div>
          <h1
            className="font-heavy uppercase leading-[0.92] text-[clamp(2.4rem,9vw,5rem)] mb-7"
            style={{ color: "#f4f1e8" }}
          >
            {panel.title}
          </h1>
          <p className="font-body text-bone-dim text-lg sm:text-xl leading-relaxed max-w-xl">
            {panel.body}
          </p>

          <div className="mt-12 flex items-center gap-4">
            <div className="flex gap-2">
              {PANELS.map((_, idx) => (
                <span
                  key={idx}
                  className="h-2 rounded-none transition-all"
                  style={{
                    width: idx === i ? "28px" : "10px",
                    background: idx === i ? panel.accent : "#33333b",
                  }}
                />
              ))}
            </div>
            <div className="flex-1" />
            <button
              onClick={onDone}
              className="font-mono text-xs uppercase tracking-widest text-bone-faint hover:text-bone transition"
            >
              Passer
            </button>
            <button
              onClick={() => (last ? onDone() : setI(i + 1))}
              className="font-heavy uppercase text-sm tracking-wider px-7 py-3 border-2 border-void bg-bone text-void shadow-hard hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-hard-sm transition-all"
              style={last ? { background: panel.accent } : undefined}
            >
              {last ? "Commencer" : "Suite"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
