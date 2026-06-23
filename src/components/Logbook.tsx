import { useMemo, useState } from "react";
import type { Entry } from "../db";
import { computeStats } from "../stats";
import { outcomeMeta } from "../outcomes";
import { formatDate, relativeFromNow } from "../time";

type Filter = "all" | "cracked" | "untouched" | "abandoned";

export function Logbook({
  entries,
  onDelete,
  onResume,
  onStart,
}: {
  entries: Entry[];
  onDelete: (id: number) => void;
  onResume: (e: Entry) => void;
  onStart: () => void;
}) {
  const stats = useMemo(() => computeStats(entries), [entries]);
  const [filter, setFilter] = useState<Filter>("all");

  const sorted = useMemo(
    () => [...entries].sort((a, b) => (b.resolvedAt ?? b.acceptedAt ?? b.drawnAt) - (a.resolvedAt ?? a.acceptedAt ?? a.drawnAt)),
    [entries],
  );

  const shown = useMemo(() => {
    switch (filter) {
      case "cracked":
        return sorted.filter((e) => e.outcome === "cracked");
      case "untouched":
        return sorted.filter((e) => e.acceptedAt === null && e.outcome === null);
      case "abandoned":
        return sorted.filter((e) => e.outcome === "abandoned");
      default:
        return sorted;
    }
  }, [sorted, filter]);

  if (entries.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="font-display text-bone-faint text-6xl mb-4">∅</div>
        <h2 className="font-heavy uppercase text-xl text-bone mb-2">Carnet vide</h2>
        <p className="font-body text-bone-dim mb-8 max-w-sm mx-auto">
          Rien de tiré, rien de fui. Pour l'instant. Tire ta première contrainte et je
          commence à compter.
        </p>
        <button
          onClick={onStart}
          className="border-2 border-void bg-signal text-void font-heavy uppercase tracking-wider px-7 py-3 shadow-hard hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-hard-sm transition-all"
        >
          Tire une contrainte
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-6 pb-28 pt-2">
      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Stat value={`${Math.round(stats.attemptRate * 100)}%`} label="Taux de tentative" accent="#3ec8ff" />
        <Stat value={stats.streak} label="Jours d'affilée" accent="#d8ff3e" suffix={flame(stats.streak)} />
        <Stat value={stats.cracked} label="Ça t'a ouvert" accent="#9b7bff" />
        <Stat value={stats.total} label="Tirées en tout" accent="#f4f1e8" />
      </div>

      {/* honest accountability line */}
      {stats.untouched > 0 && (
        <button
          onClick={() => setFilter("untouched")}
          className="w-full text-left border-2 border-dodged/60 bg-void-soft px-4 py-3 mb-6 hover:border-dodged transition group"
        >
          <span className="font-mono text-sm text-dodged">
            {stats.untouched} contrainte{stats.untouched > 1 ? "s" : ""} tirée
            {stats.untouched > 1 ? "s" : ""} et jamais tentée{stats.untouched > 1 ? "s" : ""}.
          </span>
          <span className="font-body text-sm text-bone-dim ml-2 group-hover:text-bone">
            Tu sais ce qu'il te reste à faire →
          </span>
        </button>
      )}

      {/* breakdown bar */}
      <Breakdown stats={stats} />

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2 mt-7 mb-4">
        {(
          [
            ["all", "Tout"],
            ["cracked", "Ça m'a ouvert"],
            ["untouched", "Jamais tentées"],
            ["abandoned", "Abandonnées"],
          ] as [Filter, string][]
        ).map(([f, label]) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`font-mono text-xs uppercase tracking-widest px-3 py-1.5 border-2 transition ${
              filter === f
                ? "border-bone text-void bg-bone"
                : "border-void-line text-bone-faint hover:text-bone"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ENTRIES */}
      <div className="space-y-3">
        {shown.length === 0 && (
          <p className="font-mono text-sm text-bone-faint py-6 text-center">Rien ici.</p>
        )}
        {shown.map((e) => (
          <LogRow key={e.id} entry={e} onDelete={onDelete} onResume={onResume} />
        ))}
      </div>
    </div>
  );
}

function flame(streak: number): string {
  return streak >= 3 ? " 🔥" : "";
}

function Stat({
  value,
  label,
  accent,
  suffix,
}: {
  value: string | number;
  label: string;
  accent: string;
  suffix?: string;
}) {
  return (
    <div className="border-2 border-void-line bg-void-soft px-4 py-3">
      <div className="font-display text-3xl sm:text-4xl leading-none" style={{ color: accent }}>
        {value}
        {suffix}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-bone-faint mt-1.5">
        {label}
      </div>
    </div>
  );
}

function Breakdown({ stats }: { stats: ReturnType<typeof computeStats> }) {
  const segs = [
    { v: stats.cracked, c: "#9b7bff", l: "ouvert" },
    { v: stats.completed, c: "#d8ff3e", l: "accompli" },
    { v: stats.attemptedOnly, c: "#3ec8ff", l: "tenté" },
    { v: stats.abandoned, c: "#ff5b6e", l: "abandonné" },
    { v: stats.open, c: "#ff7a1a", l: "en cours" },
    { v: stats.untouched, c: "#33333b", l: "jamais tenté" },
  ].filter((s) => s.v > 0);
  const total = segs.reduce((a, s) => a + s.v, 0) || 1;

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden border-2 border-void-line">
        {segs.map((s, i) => (
          <span
            key={i}
            style={{ width: `${(s.v / total) * 100}%`, background: s.c }}
            title={`${s.l} : ${s.v}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
        {segs.map((s, i) => (
          <span key={i} className="font-mono text-[10px] uppercase tracking-wider text-bone-faint inline-flex items-center gap-1.5">
            <span className="w-2 h-2 inline-block" style={{ background: s.c }} />
            {s.l} {s.v}
          </span>
        ))}
      </div>
    </div>
  );
}

function LogRow({
  entry,
  onDelete,
  onResume,
}: {
  entry: Entry;
  onDelete: (id: number) => void;
  onResume: (e: Entry) => void;
}) {
  const meta = outcomeMeta(entry.outcome);
  const isOpen = entry.acceptedAt !== null && entry.outcome === null;
  const isUntouched = entry.acceptedAt === null && entry.outcome === null;

  return (
    <div className="group border-2 border-void-line bg-void-soft hover:border-void-mute transition">
      <div className="flex items-stretch">
        {/* status spine */}
        <div
          className="w-1.5 shrink-0"
          style={{
            background: meta ? meta.color : isOpen ? "#ff7a1a" : "#33333b",
          }}
        />
        <div className="flex-1 px-4 py-3 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            {meta ? (
              <span
                className="font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5"
                style={{ background: meta.color, color: "#0d0d0f" }}
              >
                {meta.verb}
              </span>
            ) : isOpen ? (
              <span className="font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 bg-ember text-void">
                EN COURS
              </span>
            ) : (
              <span className="font-mono text-[10px] uppercase tracking-widest px-1.5 py-0.5 border border-void-mute text-bone-faint">
                JAMAIS TENTÉ
              </span>
            )}
            <span className="font-mono text-[10px] uppercase tracking-wide text-bone-faint">
              {entry.disciplineLabel}
            </span>
            {entry.wasReroll && (
              <span className="font-mono text-[10px] text-bone-faint" title="Issue d'une relance">
                ↻
              </span>
            )}
            <span className="font-mono text-[10px] text-bone-faint ml-auto">
              {relativeFromNow(entry.resolvedAt ?? entry.acceptedAt ?? entry.drawnAt)}
            </span>
          </div>

          <p className="font-body text-[15px] leading-snug text-bone">{entry.constraint}</p>

          {entry.note && (
            <p className="font-body text-sm text-bone-dim mt-2 pl-3 border-l-2 border-void-mute italic">
              {entry.note}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2.5">
            {isOpen && (
              <button
                onClick={() => onResume(entry)}
                className="font-mono text-[11px] uppercase tracking-widest text-ember hover:text-bone transition"
              >
                Reprendre →
              </button>
            )}
            {isUntouched && (
              <button
                onClick={() => onResume(entry)}
                className="font-mono text-[11px] uppercase tracking-widest text-volt hover:text-bone transition"
              >
                L'accepter maintenant →
              </button>
            )}
            <span className="font-mono text-[10px] text-bone-faint">
              {formatDate(entry.drawnAt)}
            </span>
            <button
              onClick={() => entry.id != null && onDelete(entry.id)}
              className="ml-auto font-mono text-[11px] text-void-mute hover:text-dodged transition opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="Supprimer"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
