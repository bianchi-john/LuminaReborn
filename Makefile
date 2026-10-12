# Shortcuts. `make` on its own shows the list.
COMPOSE     := docker compose
COMPOSE_DEV := docker compose -f docker-compose.yml -f docker-compose.dev.yml
# Node in a container: no need to install it on the machine
# (node_modules in a Docker volume: no root-owned files in the project folder)
NODE        := docker run --rm -v "$(CURDIR)":/app -v lumina-node-modules:/app/node_modules -w /app node:22-alpine

.DEFAULT_GOAL := help
.PHONY: help setup up down restart logs ps dev reset-demo backup restore export test typecheck test-e2e grant-media mongo-auth db verifica-produzione scansione-sicurezza

help: ## Show the available commands
	@grep -hE '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "} {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

setup: ## Prepare .env, the Docker network and the backup folders (first install)
	@test -f .env || (cp .env.example .env && chmod 600 .env && echo "Created .env from .env.example: change the passwords and JWT_SECRET")
	@docker network inspect extern >/dev/null 2>&1 || docker network create extern >/dev/null
	@mkdir -p backups/db backups/excel

up: setup ## Start the site (loads the demo works on first start)
	$(COMPOSE) up -d --build
	@echo "Site: http://localhost:$${APP_PORT:-3000}"

down: ## Stop the containers (data is kept)
	$(COMPOSE) down

restart: ## Restart the application
	$(COMPOSE) restart nodeapp

logs: ## Follow the application logs
	$(COMPOSE) logs -f nodeapp

ps: ## Service status
	$(COMPOSE) ps

dev: setup ## Development with automatic code reload
	$(COMPOSE_DEV) up --build

reset-demo: setup ## Delete all data and reload the demo works and demo users
	./scripts/demo-reset.sh

backup: setup ## Back up the database now to backups/db
	$(COMPOSE) run --rm backup once

restore: ## Restore a backup: make restore FILE=backups/db/lumina-....sql.gz
	./scripts/restore.sh "$(FILE)"

export: ## Export the catalogue to Excel now, in backups/excel
	$(COMPOSE) exec nodeapp node dist/cli/esporta.js

grant-media: ## Create the image database on older installations
	./scripts/grant-media.sh

mongo-auth: ## Enable MongoDB authentication on older installations
	./scripts/mongo-auth.sh

verifica-produzione: ## Check that .env is fit for production (passwords, HTTPS, ...)
	./scripts/verifica-produzione.sh

scansione-sicurezza: ## OWASP ZAP (baseline) scan of the running instance, report in backups/zap
	@mkdir -p backups/zap && chmod 777 backups/zap && cp scripts/zap-regole.conf backups/zap/
	docker run --rm --network host -v "$(CURDIR)/backups/zap":/zap/wrk ghcr.io/zaproxy/zaproxy:stable \
		zap-baseline.py -t $${BASE_URL:-http://localhost:3000} -c zap-regole.conf -r zap-rapporto.html

db: ## MySQL console
	$(COMPOSE) exec mysqldb sh -c 'mysql -u"$$MYSQL_USER" -p"$$MYSQL_PASSWORD" "$$MYSQL_DATABASE"'

typecheck: ## TypeScript type check
	$(NODE) sh -c "npm ci --no-audit --no-fund --silent && npm run typecheck"

test: ## Unit tests
	$(NODE) sh -c "npm ci --no-audit --no-fund --silent && npm test"

test-e2e: ## End-to-end tests against the running instance (BASE_URL, default http://localhost:3000)
	docker run --rm --network host -e BASE_URL=$${BASE_URL:-http://localhost:3000} -v "$(CURDIR)":/app -v lumina-node-modules:/app/node_modules -w /app node:22-alpine \
		sh -c "npm ci --no-audit --no-fund --silent && npm run test:e2e"
