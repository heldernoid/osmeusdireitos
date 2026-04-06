"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface Props {
  queryId: string;
}

type State = "idle" | "submitting" | "done";

export default function FeedbackWidget({ queryId }: Props) {
  const [state, setState] = useState<State>("idle");
  const [chosen, setChosen] = useState<boolean | null>(null);

  const submit = async (helpful: boolean) => {
    if (state !== "idle") return;
    setChosen(helpful);
    setState("submitting");
    try {
      await api.feedback({ query_id: queryId, helpful });
    } catch {
      // best-effort, ignore errors
    }
    setState("done");
  };

  if (state === "done") {
    return (
      <div className="flex items-center justify-center gap-2 py-3 text-sm text-[var(--text-muted)]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Obrigado pelo teu feedback!
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-3">
      <p className="text-sm text-[var(--text-muted)]">Esta analise foi util?</p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => submit(true)}
          disabled={state === "submitting"}
          className="flex items-center gap-2 h-9 px-4 rounded-full border border-[var(--border)] bg-white text-sm text-[var(--text-secondary)] hover:border-green-400 hover:text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
            <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
          </svg>
          Sim
        </button>
        <button
          type="button"
          onClick={() => submit(false)}
          disabled={state === "submitting"}
          className="flex items-center gap-2 h-9 px-4 rounded-full border border-[var(--border)] bg-white text-sm text-[var(--text-secondary)] hover:border-red-300 hover:text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
            <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
          </svg>
          Nao
        </button>
      </div>
    </div>
  );
}
