"use client";

import { useState } from "react";
import type { ArticleCited } from "@/lib/types";

export default function ArticleCard({ article }: { article: ArticleCited }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-[var(--border)] rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--bg-subtle)] transition-colors"
        aria-expanded={expanded}
      >
        <span className="w-9 h-9 rounded-full bg-[var(--primary-light)] text-[var(--primary-dark)] text-[13px] font-bold flex items-center justify-center flex-shrink-0">
          {article.number}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text)] leading-snug truncate">
            {article.title || `Artigo ${article.number}`}
          </p>
          {article.source && (
            <p className="text-[10px] text-[var(--text-muted)] leading-snug mb-0.5 font-mono opacity-70">
              {article.source}
            </p>
          )}
          <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-snug line-clamp-1">
            {article.relevance}
          </p>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`flex-shrink-0 text-[var(--text-muted)] transition-transform ${expanded ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-[var(--border)] bg-[var(--bg-subtle)]">
          {article.excerpt && (
            <blockquote className="border-l-2 border-[var(--primary-muted)] pl-3 mb-3">
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic">
                &ldquo;{article.excerpt}&rdquo;
              </p>
            </blockquote>
          )}
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            <span className="font-semibold text-[var(--primary-dark)]">Relevancia: </span>
            {article.relevance}
          </p>
        </div>
      )}
    </div>
  );
}
