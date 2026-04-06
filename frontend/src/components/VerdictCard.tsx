"use client";

import type { Severity } from "@/lib/types";

interface Props {
  violated: boolean;
  severity: Severity;
  verdictSummary: string;
  explanation: string;
}

const SEVERITY_LABEL: Record<Severity, string> = {
  low: "Gravidade baixa",
  medium: "Gravidade média",
  high: "Gravidade alta",
};

const SEVERITY_STYLE: Record<Severity, string> = {
  low: "bg-amber-50 text-amber-700 border-amber-200",
  medium: "bg-orange-50 text-orange-700 border-orange-200",
  high: "bg-red-50 text-red-700 border-red-200",
};

export default function VerdictCard({ violated, severity, verdictSummary, explanation }: Props) {
  if (violated) {
    return (
      <div className="rounded-xl border-2 border-red-200 bg-red-50 p-5">
        <div className="flex items-start gap-3 mb-3">
          <span className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" aria-hidden="true">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold uppercase tracking-wider text-red-700 mb-1">
              Direitos possivelmente violados
            </p>
            <p className="text-[15px] font-semibold text-[var(--text)] leading-snug">{verdictSummary}</p>
          </div>
        </div>
        <span className={`inline-block text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${SEVERITY_STYLE[severity]}`}>
          {SEVERITY_LABEL[severity]}
        </span>
        <p className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed">{explanation}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-green-200 bg-green-50 p-5">
      <div className="flex items-start gap-3 mb-3">
        <span className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold uppercase tracking-wider text-green-700 mb-1">
            Sem violação identificada
          </p>
          <p className="text-[15px] font-semibold text-[var(--text)] leading-snug">{verdictSummary}</p>
        </div>
      </div>
      <p className="mt-1 text-sm text-[var(--text-secondary)] leading-relaxed">{explanation}</p>
    </div>
  );
}
