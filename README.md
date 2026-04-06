# Os Meus Direitos

Ferramenta gratuita de assessoria jurídica para cidadãos moçambicanos.

O utilizador descreve uma situação real. A app analisa contra a legislação moçambicana (Constituição, Lei do Trabalho, Lei da Família, Código Penal, EGFAE, Direitos da Criança — mais de 1300 artigos) e responde: houve violação? Quais os artigos? O que fazer?

![Demo](demo.gif)

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Backend | Python 3.11 + FastAPI |
| RAG | ChromaDB + pdfplumber |
| Embeddings | Ollama — `nomic-embed-text` |
| LLM | Ollama — `ministral-3:3b` (ou OpenRouter se configurado) |
| Base de dados | SQLite (via aiosqlite) |
| Infra | Docker + Docker Compose |

---

## Requisitos

- [Docker](https://docs.docker.com/get-docker/) e Docker Compose
- [Ollama](https://ollama.com) a correr em `localhost:11434` com os modelos:

```bash
ollama pull ministral-3:3b
ollama pull nomic-embed-text
```

---

## Comandos

```bash
make up        # build + arrancar em background
make down      # parar
make restart   # reiniciar containers
make build     # só build
make logs      # logs em tempo real
make index     # indexar todos os PDFs em backend/data/raw/
```

---

## Arrancar (3 passos)

### 1. Clonar e configurar

```bash
git clone <repo>
cd os-meus-direitos
cp backend/.env.example backend/.env   # configuração padrão já funciona
```

### 2. Indexar os documentos

Só é necessário fazer isto uma vez. Cria os embeddings e guarda-os em `backend/data/chroma/`.

> ⚠️ Se aparecer "network error" ao fazer uma query, é porque este passo não foi executado.

```bash
make index
```

### 3. Iniciar a app

```bash
make up
```

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3005 |
| Backend API | http://localhost:8005 |

---

## Estrutura do projecto

```
os-meus-direitos/
├── backend/
│   ├── src/
│   │   ├── ingestion/   # parse PDFs + embeddings
│   │   ├── rag/         # retriever + pipeline + prompts
│   │   └── main.py      # FastAPI app
│   ├── tests/
│   └── data/
│       └── raw/         # PDFs indexados
├── frontend/
│   └── src/
│       ├── app/         # Next.js App Router
│       └── components/  # UI components
├── docker-compose.yml
└── Makefile
```

---

## Testes

```bash
# Unitários (sem Ollama necessário)
docker compose run --rm backend pytest tests/ -m "not integration" -v

# Integração (requer Ollama + índice)
docker compose run --rm backend pytest tests/ -v
```

---

## Deploy

A app é completamente auto-contida via Docker. Para deploy em servidor próprio:

1. Instala o Ollama no servidor e faz pull dos modelos
2. Clona o repositório e copia `backend/.env.example` para `backend/.env`
3. `make index`
4. `make up`

---

## Licença

MIT
