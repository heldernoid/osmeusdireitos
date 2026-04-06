"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { QueryResponse } from "@/lib/types";
import VerdictCard from "@/components/VerdictCard";
import ArticleCard from "@/components/ArticleCard";
import FeedbackWidget from "@/components/FeedbackWidget";


function Skeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse" aria-hidden="true">
      <div className="h-32 rounded-xl bg-[var(--bg-subtle)]" />
      <div className="h-5 w-40 rounded bg-[var(--bg-subtle)]" />
      <div className="flex flex-col gap-2">
        <div className="h-14 rounded-lg bg-[var(--bg-subtle)]" />
        <div className="h-14 rounded-lg bg-[var(--bg-subtle)]" />
        <div className="h-14 rounded-lg bg-[var(--bg-subtle)]" />
      </div>
      <div className="h-24 rounded-xl bg-[var(--bg-subtle)]" />
    </div>
  );
}

export default function ResultadoPage() {
  const router = useRouter();
  const [result, setResult] = useState<QueryResponse | null>(null);
  const [situation, setSituation] = useState<string>("");

  useEffect(() => {
    const raw = sessionStorage.getItem("omd_result");
    const sit = sessionStorage.getItem("omd_situation");
    if (!raw) {
      router.replace("/");
      return;
    }
    setResult(JSON.parse(raw) as QueryResponse);
    setSituation(sit ?? "");
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex flex-col">
      {/* Header */}
      <header className="h-14 bg-white border-b border-[var(--border)] flex items-center px-4 gap-3 sticky top-0 z-10">
        <button
          onClick={() => router.push("/")}
          className="w-9 h-9 rounded-lg border border-[var(--border)] flex items-center justify-center bg-white cursor-pointer hover:bg-[var(--bg-subtle)] transition-colors"
          aria-label="Voltar"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <span className="text-[15px] font-semibold text-[var(--text)]">Resultado da analise</span>
      </header>

      <main className="flex-1 w-full max-w-[640px] mx-auto px-4 pt-5 pb-16">
        {!result ? (
          <Skeleton />
        ) : (
          <div className="flex flex-col gap-5">
            {/* Situation snippet */}
            {situation && (
              <div className="bg-white border border-[var(--border)] rounded-lg px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  Situação analisada
                </p>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                  {situation}
                </p>
              </div>
            )}

            {/* Verdict */}
            <VerdictCard
              violated={result.violated}
              severity={result.severity}
              verdictSummary={result.verdict_summary}
              explanation={result.explanation}
            />

            {/* Articles */}
            {result.articles_cited.length > 0 && (
              <section>
                <p className="text-[13px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2.5">
                  Artigos relevantes ({result.articles_cited.length})
                </p>
                <div className="flex flex-col gap-2">
                  {result.articles_cited.map((a) => (
                    <ArticleCard key={a.number} article={a} />
                  ))}
                </div>
              </section>
            )}

            {/* Next steps */}
            {result.next_steps.length > 0 && (
              <section className="bg-white border border-[var(--border)] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <p className="text-[15px] font-semibold text-[var(--text)]">O que podes fazer</p>
                </div>
                <ol className="flex flex-col gap-3">
                  {result.next_steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[var(--primary-light)] text-[var(--primary-dark)] text-[12px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Feedback */}
            <div className="bg-white border border-[var(--border)] rounded-xl px-5 py-4">
              <FeedbackWidget queryId={result.query_id} />
            </div>

            {/* Legal disclaimer */}
            <p className="text-xs text-center text-[var(--text-muted)] leading-relaxed px-2">
              Esta análise é automática e tem caráter informativo. Não substitui aconselhamento jurídico
              profissional. Em caso de urgência, contacta a{" "}
              <a href="https://cddmoz.org/" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] underline">
                CDD - Centro para Democracia e Direitos Humanos
              </a>: +258 84 325 7043
              .
            </p>

            {/* Analyze again */}
            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full h-[48px] bg-white border border-[var(--border)] rounded-lg text-sm font-semibold text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--bg-subtle)] transition-colors"
            >
              Analisar outra situação
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
