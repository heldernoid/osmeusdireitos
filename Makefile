.PHONY: up down restart build logs index

up:
	docker compose build && docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

build:
	docker compose build

logs:
	docker compose logs -f

index:
	docker compose exec backend python -m src.ingestion.run_ingestion

tunnel-dev:
	ngrok http 3005

tunnel-prod:
	ngrok http --url=osmeusdireitosmz.ngrok.app 3005
