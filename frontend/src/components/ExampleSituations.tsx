"use client";

interface Example {
  id: number;
  text: string;
  category: string;
}

const EXAMPLES: Example[] = [
  { id: 1, text: "Um polícia pediu-me dinheiro de refresco e ameaçou-me de prisão.", category: "Polícia" },
  { id: 2, text: "Fui preso por me juntar a uma manifestação pacífica contra os raptos e fiquei uma noite na cadeia sem direito a advogado.", category: "Detenção" },
  { id: 3, text: "O dono do imóvel quer expulsar-me de casa sem aviso nem razão.", category: "Habitação" },
  { id: 4, text: "Fui despedido sem explicação e sem receber o que me era devido.", category: "Trabalho" },
  { id: 5, text: "A polícia entrou na minha casa de noite sem mandado judicial.", category: "Domicílio" },
];

interface Props {
  onSelect: (text: string) => void;
}

export default function ExampleSituations({ onSelect }: Props) {
  return (
    <div>
      <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-2.5">
        Situações frequentes
      </p>
      <div
        className="flex gap-2.5 overflow-x-auto pb-2 -mx-4 px-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
      >
        {EXAMPLES.map((ex) => (
          <button
            key={ex.id}
            onClick={() => onSelect(ex.text)}
            className="flex-shrink-0 w-[220px] flex flex-col bg-[var(--bg-subtle)] border border-[var(--border)] rounded-lg p-3 text-left transition-colors hover:border-[var(--primary-muted)] hover:bg-[var(--primary-light)] active:scale-[0.98] cursor-pointer"
          >
            <span className="inline-block self-start text-[10px] font-semibold uppercase tracking-wider text-[var(--primary-dark)] bg-[var(--primary-light)] px-1.5 py-0.5 rounded-full mb-1.5 flex-shrink-0">
              {ex.category}
            </span>
            <p className="text-sm text-[var(--text)] leading-snug">{ex.text}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
