"use client";

import type { Language } from "@/lib/types";

interface Props {
  language: Language;
  onChange: (lang: Language) => void;
}

const LANGS: { code: Language; label: string; available: boolean }[] = [
  { code: "pt", label: "PT", available: true },
  { code: "emk", label: "EMK", available: false },
  { code: "cha", label: "CHA", available: false },
  { code: "sen", label: "SEN", available: false },
];

export default function LanguageSelector({ language, onChange }: Props) {
  return (
    <div className="flex gap-1" role="group" aria-label="Selecionar língua">
      {LANGS.map(({ code, label, available }) => (
        <button
          key={code}
          onClick={() => available && onChange(code)}
          disabled={!available}
          title={available ? undefined : "Em breve"}
          aria-pressed={language === code}
          className={[
            "h-7 px-2.5 rounded-full border text-xs font-medium transition-colors",
            language === code && available
              ? "bg-[var(--primary-light)] border-[var(--primary-muted)] text-[var(--primary-dark)]"
              : available
                ? "bg-white border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
                : "bg-white border-[var(--border)] text-[var(--text-muted)] cursor-not-allowed",
          ].join(" ")}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
