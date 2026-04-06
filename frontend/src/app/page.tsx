"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SituationInput from "@/components/SituationInput";
import AnalysisPhases, { type PhasesState } from "@/components/AnalysisPhases";
import { api } from "@/lib/api";
import type { StreamEvent } from "@/lib/types";

const INITIAL_PHASES: PhasesState = {
  classify: "pending",
  retrieve: "pending",
  analyze: "pending",
};

export default function HomePage() {
  const router = useRouter();
  const [situation, setSituation] = useState("");
  const [loading, setLoading] = useState(false);
  const [phases, setPhases] = useState<PhasesState>(INITIAL_PHASES);
  const [failedMessage, setFailedMessage] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  const canSubmit = situation.trim().length >= 10 && !loading;

  const reset = () => {
    setLoading(false);
    setPhases(INITIAL_PHASES);
    setFailedMessage(undefined);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    setFailedMessage(undefined);
    setPhases(INITIAL_PHASES);

    try {
      await api.queryStream(
        { situation: situation.trim(), language: "pt" },
        (event: StreamEvent) => {
          const { phase, status, message, result } = event;

          setPhases((prev) => ({ ...prev, [phase]: status }));

          if (status === "failed") {
            setFailedMessage(message);
            setLoading(false);
          }

          if (phase === "analyze" && status === "done" && result) {
            sessionStorage.setItem("omd_result", JSON.stringify(result));
            sessionStorage.setItem("omd_situation", situation.trim());
            router.push("/resultado");
          }
        },
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao analisar. Tenta novamente.");
      setLoading(false);
      setPhases(INITIAL_PHASES);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex flex-col">
      {/* Header */}
      <header className="h-14 bg-white border-b border-[var(--border)] flex items-center px-4 gap-2.5 sticky top-0 z-10">
        <div className="grid grid-cols-2 gap-[3px] flex-shrink-0" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full bg-[#009A44]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#000000]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FCB514]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#CE1126]" />
        </div>
        <div>
          <div className="text-lg font-bold text-[var(--text)] tracking-tight leading-none">
            Os Meus <span className="text-[var(--primary)]">Direitos</span>
          </div>
          <div className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-widest mt-0.5">
            Constituição de Moçambique
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 w-full max-w-[640px] mx-auto px-4 pt-6 pb-20">

        {/* Hero */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-1.5 mb-3">
            <span className="w-3 h-3 rounded-full bg-[#009A44]" aria-hidden="true" />
            <span className="w-3 h-3 rounded-full bg-[#000000]" aria-hidden="true" />
            <span className="w-3 h-3 rounded-full bg-[#FCB514]" aria-hidden="true" />
            <span className="w-3 h-3 rounded-full bg-[#CE1126]" aria-hidden="true" />
          </div>
          <h1 className="text-[22px] font-bold text-[var(--text)] tracking-tight leading-snug mb-2">
            Conhece os teus direitos.<br />
            A Constituição protege-te.
          </h1>
          <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed max-w-[480px] mx-auto">
            Descreve o que aconteceu. A app analisa se os teus direitos constitucionais foram violados e diz-te o que podes fazer.
          </p>
        </div>

        {/* Input */}
        <div className="mb-4">
          <SituationInput value={situation} onChange={setSituation} />
        </div>

        {/* Error */}
        {error && (
          <p role="alert" className="text-sm text-red-600 mb-3 text-center">
            {error}
          </p>
        )}

        {/* Phases UI (shown while loading or when failed) */}
        {loading || Object.values(phases).some((s) => s === "failed") ? (
          <AnalysisPhases phases={phases} failedMessage={failedMessage} onReset={reset} />
        ) : (
          /* Submit */
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full h-[52px] bg-[var(--primary)] text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-[background,box-shadow] flex items-center justify-center gap-2 hover:bg-[var(--primary-dark)] hover:shadow-[0_2px_8px_rgba(22,163,74,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <>
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              Analisar a minha situação
            </>
          </button>
        )}

        {/* How it works */}
        <div className="mt-8 p-5 bg-white border border-[var(--border)] rounded-xl">
          <p className="text-[15px] font-semibold text-[var(--text)] mb-4">Como funciona</p>
          <div className="flex flex-col gap-3.5">
            {[
              { n: 1, text: "<strong>Descreve</strong> o que aconteceu, com as tuas próprias palavras." },
              { n: 2, text: "<strong>A app analisa</strong> a situação contra todos os artigos da Constituição de Moçambique." },
              { n: 3, text: "<strong>Recebe</strong> uma explicação clara e os passos concretos que podes tomar." },
            ].map(({ n, text }) => (
              <div key={n} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-[var(--primary-light)] text-[var(--primary-dark)] text-[13px] font-bold flex items-center justify-center flex-shrink-0">
                  {n}
                </span>
                <p
                  className="text-sm text-[var(--text-secondary)] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: text }}
                />
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center px-4 py-5 text-xs text-[var(--text-muted)] leading-relaxed border-t border-[var(--border)]">
        Esta análise tem caráter informativo e não substitui aconselhamento jurídico profissional.<br />
        Em situações urgentes, contacta a{" "}
        <a href="https://cddmoz.org/" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)]">
          CDD - Centro para Democracia e Direitos Humanos
        </a>: +258 84 325 7043
        <br />
        <br />
        <a href="/sobre" className="text-[var(--primary)]">
          Sobre a app
        </a>{" "}
        &middot; Constituição da República de Moçambique (2004, revista 2018)
        <br />
        Criado por{" "}
        <a
          href="https://www.linkedin.com/in/helmo/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--primary)]"
        >
          Hélder Monteiro
        </a>
      </footer>
    </div>
  );
}
