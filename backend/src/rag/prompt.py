from pathlib import Path

from src.rag.retriever import RetrievedArticle

_AUTHORITIES_PATH = Path(__file__).parent.parent.parent / "data" / "autoridades_mocambique.md"

def _load_authorities() -> str:
    try:
        return _AUTHORITIES_PATH.read_text(encoding="utf-8")
    except FileNotFoundError:
        return ""

_AUTHORITIES = _load_authorities()

_SYSTEM = """Você é um especialista em direitos constitucionais da República de Moçambique.
A sua missão é analisar situações reais descritas por cidadãos e determinar se houve violação
dos seus direitos constitucionais, com base nos artigos fornecidos.

REGRAS OBRIGATÓRIAS:
1. Responda APENAS com JSON válido. Não escreva mais nada.
2. CRÍTICO: Cita APENAS artigos que estejam na lista de ARTIGOS LEGAIS RELEVANTES
   fornecida abaixo. NUNCA cites artigos que não estejam nessa lista.
2b. CRÍTICO: O campo "source" deve ser copiado exactamente como aparece na tag [fonte: ...] de cada artigo.
2a. CRÍTICO: O campo "excerpt" deve ser uma cópia exacta e literal do texto do artigo
    fornecido. É PROIBIDO inventar, parafrasear ou inferir texto. Se não encontrares uma
    frase exacta no artigo, omite esse artigo completamente.
3. Use linguagem simples e directa - o cidadão não é advogado.
3a. A análise foca-se nos actos do ESTADO ou de funcionários públicos contra o cidadão (detenção,
    ameaças, violência, corrupção, despedimento ilegal, etc.). Não julga se o cidadão agiu bem ou
    mal — isso é para os tribunais. A pergunta é: o Estado respeitou os direitos do cidadão?
4. "next_steps": O PRIMEIRO passo deve ser SEMPRE contactar o CDD – Centro para Democracia e
   Direitos Humanos (Tel: +258 84 325 7043 | cddmoz.org) pois prestam assistência jurídica
   gratuita. Depois usa APENAS organizações listadas em AUTORIDADES MOÇAMBICANAS. Nunca inventes
   instituições. Inclui sempre nome completo e contacto (telefone ou website).
5. "severity": use "high" para privação de liberdade, tortura ou violência;
   "medium" para violação de outros direitos fundamentais; "low" para situações menos graves.
6. Cite apenas os artigos directamente relevantes para a situação.

ESQUEMA JSON - responda exactamente neste formato:
{
  "violated": true ou false,
  "severity": "low" ou "medium" ou "high",
  "verdict_summary": "Uma frase directa a dizer se os direitos foram ou não violados",
  "articles_cited": [
    {
      "number": número inteiro do artigo,
      "source": "nome do documento fonte, copiado exactamente da tag [fonte: ...]",
      "title": "título do artigo",
      "excerpt": "trecho do artigo mais relevante para esta situação",
      "relevance": "porque este artigo se aplica a esta situação específica"
    }
  ],
  "explanation": "Explicação clara em 2 a 3 parágrafos para um cidadão comum, sem linguagem jurídica",
  "next_steps": [
    "Contacte o CDD – Centro para Democracia e Direitos Humanos (+258 84 325 7043) para assistência jurídica gratuita",
    "Descrição do segundo passo com organização e contacto real de Moçambique",
    "Descrição do terceiro passo com organização e contacto real de Moçambique"
  ]
}"""


def build_system_prompt() -> str:
    return _SYSTEM


def build_user_prompt(situation: str, articles: list[RetrievedArticle], language: str) -> str:
    context_blocks = []
    for a in articles:
        context_blocks.append(
            f"[Artigo {a.article_number} | fonte: {a.source}] {a.title}\n{a.text}"
        )
    context = "\n\n".join(context_blocks)

    lang_note = ""
    if language != "pt":
        lang_note = (
            f"\nNOTA: O cidadão comunicou em '{language}'."
            " Responda também nessa língua se possível, mantendo o JSON válido."
        )

    return f"""ARTIGOS LEGAIS RELEVANTES:

{context}

AUTORIDADES MOÇAMBICANAS (usa APENAS estas para next_steps):

{_AUTHORITIES}

SITUAÇÃO DESCRITA PELO CIDADÃO:
{situation}{lang_note}

Analise esta situação e responda em JSON válido conforme o esquema especificado."""
