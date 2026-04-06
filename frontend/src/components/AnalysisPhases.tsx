"use client";

import type { PhaseStatus } from "@/lib/types";

interface Phase {
  key: "classify" | "retrieve" | "analyze";
  label: string;
}

const PHASES: Phase[] = [
  { key: "classify", label: "A verificar situação" },
  { key: "retrieve", label: "A pesquisar artigos" },
  { key: "analyze", label: "A analisar direitos" },
];

function PhaseDot({ status }: { status: PhaseStatus }) {
  if (status === "done") {
    return (
      <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </span>
    );
  }
  if (status === "running") {
    return (
      <span className="w-5 h-5 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin flex-shrink-0" aria-hidden="true" />
    );
  }
  // pending
  return (
    <span className="w-5 h-5 rounded-full border-2 border-[var(--border)] bg-[var(--bg-subtle)] flex-shrink-0" aria-hidden="true" />
  );
}

export interface PhasesState {
  classify: PhaseStatus;
  retrieve: PhaseStatus;
  analyze: PhaseStatus;
}

interface Props {
  phases: PhasesState;
  failedMessage?: string;
  onReset: () => void;
}

export default function AnalysisPhases({ phases, failedMessage, onReset }: Props) {
  const hasFailed = Object.values(phases).includes("failed");

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white border border-[var(--border)] rounded-xl p-5 flex flex-col gap-3.5">
        {PHASES.map((p) => (
          <div key={p.key} className="flex items-center gap-3">
            <PhaseDot status={phases[p.key]} />
            <span
              className={`text-sm font-medium ${
                phases[p.key] === "running"
                  ? "text-[var(--text)]"
                  : phases[p.key] === "done"
                  ? "text-green-700"
                  : phases[p.key] === "failed"
                  ? "text-red-600"
                  : "text-[var(--text-muted)]"
              }`}
            >
              {p.label}
            </span>
          </div>
        ))}
      </div>

      {hasFailed && (
        <div className="flex flex-col gap-3">
          {failedMessage && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <p className="text-sm text-amber-800 leading-relaxed">{failedMessage}</p>
            </div>
          )}
          <button
            type="button"
            onClick={onReset}
            className="w-full h-[48px] bg-white border border-[var(--border)] rounded-lg text-sm font-semibold text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--bg-subtle)] transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  );
}
