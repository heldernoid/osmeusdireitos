"use client";

import { useRouter } from "next/navigation";

export default function SobrePage() {
  const router = useRouter();

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
        <span className="text-[15px] font-semibold text-[var(--text)]">Sobre a app</span>
      </header>

      <main className="flex-1 w-full max-w-[640px] mx-auto px-4 pt-6 pb-16 flex flex-col gap-5">

        {/* Identity */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-bold text-[var(--text)] leading-tight">
              Os Meus <span className="text-[var(--primary)]">Direitos</span>
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Legislação da República de Moçambique
            </p>
          </div>
        </div>

        {/* What */}
        <Section title="O que é esta app?">
          <p>
            <strong>Os Meus Direitos</strong> é uma ferramenta gratuita que ajuda cidadãos moçambicanos
            a compreender se os seus direitos foram violados numa situação concreta.
          </p>
          <p className="mt-2">
            Descreve o que aconteceu em linguagem simples. A app analisa automaticamente a tua
            situação contra a legislação moçambicana — Constituição, Lei do Trabalho, Lei da Família,
            Código Penal e mais — e devolve uma explicação clara e passos concretos que podes tomar.
          </p>
        </Section>

        {/* How */}
        <Section title="Como funciona?">
          <ol className="flex flex-col gap-2.5">
            {[
              "O teu texto é processado localmente — nenhum dado identificável é enviado para servidores externos.",
              "Um modelo de linguagem analisa a situação contra mais de 1300 artigos da legislação moçambicana — Constituição, Lei do Trabalho, Lei da Família, Código Penal, EGFAE e Direitos da Criança.",
              "O resultado mostra quais os artigos relevantes, se houve violação e o que podes fazer a seguir.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[var(--primary-light)] text-[var(--primary-dark)] text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </Section>

        {/* Limits */}
        <Section title="Limitações importantes">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" className="flex-shrink-0 mt-0.5" aria-hidden="true">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p className="text-sm text-amber-800 leading-relaxed">
              Esta análise tem <strong>caráter informativo</strong> e não substitui aconselhamento
              jurídico profissional. Para situações urgentes ou complexas, procura um advogado ou
              contacta a Liga dos Direitos Humanos.
            </p>
          </div>
          <ul className="mt-3 flex flex-col gap-1.5">
            {[
              "O modelo pode cometer erros — verifica sempre os artigos citados.",
              "A cobertura legal é limitada aos documentos indexados — pode não incluir todas as leis relevantes.",
              "As análises são geradas por IA e não representam opinião jurídica qualificada.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <span className="text-[var(--text-muted)] mt-0.5" aria-hidden="true">·</span>
                {item}
              </li>
            ))}
          </ul>
        </Section>

        {/* Emergency contacts */}
        <Section title="Contactos de emergência">
          <div className="flex flex-col gap-2">
            {[
              {
                label: "CDD - Centro para Democracia e Direitos Humanos",
                phone: "+258 84 325 7043",
                tel: "tel:+258843257043",
                web: "https://cddmoz.org/",
              },
              {
                label: "Ordem dos Advogados de Moçambique",
                phone: "+258 21 414 743",
                tel: "tel:+258214147430",
                web: "http://oam.org.mz/",
              },
              {
                label: "Ministério Público (PGR)",
                phone: "+258 82 130 4307",
                tel: "tel:+258821304307",
                web: "https://www.pgr.gov.mz/",
              },
            ].map(({ label, phone, tel, web }) => (
              <div
                key={tel}
                className="flex items-center justify-between p-3 bg-white border border-[var(--border)] rounded-lg gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text)] leading-snug">{label}</p>
                  <a
                    href={web}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {web.replace(/^https?:\/\//, "")}
                  </a>
                </div>
                <a
                  href={tel}
                  className="text-sm text-[var(--primary)] font-semibold flex-shrink-0 hover:text-[var(--primary-dark)] transition-colors"
                >
                  {phone}
                </a>
              </div>
            ))}
          </div>
        </Section>

        {/* Source */}
        <Section title="Fonte legal">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            A base de conhecimento inclui mais de 1300 artigos da legislação moçambicana:
            Constituição da República (2004, revista 2018), Lei do Trabalho, Lei da Família,
            Código Penal, Estatuto Geral dos Funcionários e Agentes do Estado (EGFAE)
            e Lei dos Direitos da Criança.
          </p>
          <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            Os artigos relevantes são citados directamente no resultado de cada análise.
          </p>
        </Section>

        {/* Footer note */}
        <p className="text-xs text-center text-[var(--text-muted)] leading-relaxed pb-2">
          Projecto de código aberto · Licença MIT
        </p>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-[var(--border)] rounded-xl p-5">
      <p className="text-[15px] font-semibold text-[var(--text)] mb-3">{title}</p>
      <div className="text-sm text-[var(--text-secondary)] leading-relaxed">{children}</div>
    </section>
  );
}
