# Comandi rapidi. `make` da solo mostra l'elenco.
COMPOSE     := docker compose
COMPOSE_DEV := docker compose -f docker-compose.yml -f docker-compose.dev.yml
# Node in un container: non serve installarlo sulla macchina
# (node_modules in un volume Docker: niente file di root nella cartella del progetto)
NODE        := docker run --rm -v "$(CURDIR)":/app -v lumina-node-modules:/app/node_modules -w /app node:22-alpine

.DEFAULT_GOAL := help
.PHONY: help setup up down restart logs ps dev reset-demo backup restore export test typecheck test-e2e grant-media db

help: ## Mostra i comandi disponibili
	@grep -hE '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "} {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

setup: ## Prepara .env, la rete Docker e le cartelle dei backup (prima installazione)
	@test -f .env || (cp .env.example .env && chmod 600 .env && echo "Creato .env da .env.example: cambiare password e JWT_SECRET")
	@docker network inspect extern >/dev/null 2>&1 || docker network create extern >/dev/null
	@mkdir -p backups/db backups/excel

up: setup ## Avvia il sito (al primo avvio carica le opere dimostrative)
	$(COMPOSE) up -d --build
	@echo "Sito: http://localhost:$${APP_PORT:-3000}"

down: ## Ferma i container (i dati restano)
	$(COMPOSE) down

restart: ## Riavvia l'applicazione
	$(COMPOSE) restart nodeapp

logs: ## Log dell'applicazione in tempo reale
	$(COMPOSE) logs -f nodeapp

ps: ## Stato dei servizi
	$(COMPOSE) ps

dev: setup ## Sviluppo con ricarica automatica del codice
	$(COMPOSE_DEV) up --build

reset-demo: setup ## Cancella tutti i dati e ricarica le opere e gli utenti dimostrativi
	./scripts/demo-reset.sh

backup: setup ## Backup immediato del database in backups/db
	$(COMPOSE) run --rm backup once

restore: ## Ripristina un backup: make restore FILE=backups/db/lumina-....sql.gz
	./scripts/restore.sh "$(FILE)"

export: ## Esporta subito il catalogo in Excel in backups/excel
	$(COMPOSE) exec nodeapp node dist/cli/esporta.js

grant-media: ## Crea il database delle immagini su installazioni precedenti
	./scripts/grant-media.sh

db: ## Console MySQL
	$(COMPOSE) exec mysqldb sh -c 'mysql -u"$$MYSQL_USER" -p"$$MYSQL_PASSWORD" "$$MYSQL_DATABASE"'

typecheck: ## Controllo dei tipi TypeScript
	$(NODE) sh -c "npm ci --no-audit --no-fund --silent && npm run typecheck"

test: ## Test unitari
	$(NODE) sh -c "npm ci --no-audit --no-fund --silent && npm test"

test-e2e: ## Test end-to-end sull'istanza avviata (BASE_URL, default http://localhost:3000)
	docker run --rm --network host -e BASE_URL=$${BASE_URL:-http://localhost:3000} -v "$(CURDIR)":/app -v lumina-node-modules:/app/node_modules -w /app node:22-alpine \
		sh -c "npm ci --no-audit --no-fund --silent && npm run test:e2e"
