# Os Meus Direitos

Ferramenta gratuita de análise de direitos constitucionais para cidadãos moçambicanos.

O utilizador descreve uma situação real. A app analisa contra a Constituição da República de Moçambique (313 artigos) e responde: houve violação? Quais os artigos? O que fazer?

![Demo](demo.gif)

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Backend | Python 3.11 + FastAPI |
| RAG | LangChain + ChromaDB |
| Embeddings | Ollama — `nomic-embed-text` |
| LLM | Ollama — `ministral-3:3b` |
| Base de dados | SQLite (via aiosqlite) |
| Infra | Docker + Docker Compose |

Tudo corre localmente. Não é necessária qualquer chave de API externa.

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
make index     # re-indexar a Constituição
```

---

## Arrancar (3 passos)

### 1. Clonar e configurar

```bash
git clone <repo>
cd os-meus-direitos
cp backend/.env.example backend/.env   # configuração padrão já funciona
```

### 2. Indexar a Constituição

Só é necessário fazer isto uma vez. Cria os embeddings e guarda-os em `backend/data/chroma/`.

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
| Docs da API | http://localhost:8005/docs |

---

## Estrutura do projecto

```
os-meus-direitos/
├── backend/
│   ├── src/
│   │   ├── ingestion/   # parse PDF + embeddings
│   │   ├── rag/         # retriever + pipeline + prompts
│   │   └── main.py      # FastAPI app
│   ├── tests/
│   └── data/            # chroma/ + db.sqlite3 (gerados)
├── frontend/
│   └── src/
│       ├── app/         # Next.js App Router
│       └── components/  # UI components
├── ARCHITECTURE.md
├── API.md
└── PLAN.md
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
2. Copia o `docker-compose.yml` e os ficheiros de configuração
3. Corre a indexação uma vez: `docker compose run --rm backend python -m src.ingestion.run_ingestion`
4. `docker compose up -d`

---


## Licença

MIT
