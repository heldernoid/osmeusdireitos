"use client";

const MAX = 500;

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function SituationInput({ value, onChange }: Props) {
  const remaining = value.length;
  const nearLimit = remaining >= 400;

  return (
    <div className="bg-white border border-[var(--border)] rounded-xl p-4 shadow-sm">
      <label
        htmlFor="situation"
        className="block text-sm font-semibold text-[var(--text)] mb-2.5"
      >
        Descreve a tua situação
      </label>

      <textarea
        id="situation"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX))}
        placeholder="Ex. Fui despedido do trabalho sem explicação e sem receber o que me era devido."
        rows={5}
        className="w-full min-h-[120px] bg-[var(--bg-page)] border-[1.5px] border-[var(--border)] rounded-lg p-3.5 pb-2 font-[inherit] text-base text-[var(--text)] resize-none outline-none transition-[border-color,box-shadow] leading-relaxed placeholder:text-[var(--text-muted)] focus:border-[var(--border-focus)] focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)]"
        aria-describedby="char-count"
      />

      <div className="mt-1.5">
        <span
          id="char-count"
          className={`text-xs ${nearLimit ? "text-amber-600" : "text-[var(--text-muted)]"}`}
        >
          {remaining} / {MAX} caracteres
        </span>
      </div>
    </div>
  );
}
