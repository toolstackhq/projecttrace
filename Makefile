GREEN := \033[32m
RESET := \033[0m
COMPOSE ?= docker compose
PLAN ?= smoke-test.jmx
LOAD_PLAN ?= baseline-load-test.jmx
REPORT_DIR ?= reports/jmeter/latest
RESULTS_FILE ?= $(REPORT_DIR)/results.jtl
PLAN_PATH ?= tests/performance/jmeter/plans/$(PLAN)
LOAD_PLAN_PATH ?= tests/performance/jmeter/plans/$(LOAD_PLAN)
GATLING_DIR ?= tests/performance/gatling
GATLING_PLAN ?= smoke-test.gatling.js
GATLING_LOAD_PLAN ?= baseline-load-test.gatling.js
GATLING_REPORT_DIR ?= $(GATLING_DIR)/target/gatling
GATLING_PLAN_NAME := $(basename $(basename $(GATLING_PLAN)))
GATLING_LOAD_PLAN_NAME := $(basename $(basename $(GATLING_LOAD_PLAN)))
K6_PLAN ?= smoke-test.js
K6_LOAD_PLAN ?= baseline-load-test.js
K6_REPORT_DIR ?= reports/k6/latest
K6_PLAN_PATH ?= tests/performance/k6/$(K6_PLAN)
K6_LOAD_PLAN_PATH ?= tests/performance/k6/$(K6_LOAD_PLAN)
.DEFAULT_GOAL := help

.PHONY: help build test up down migrate seed reset-db backend frontend ensure-backend-ready ensure-perf-user \
	ensure-gatling-deps \
	jmeter-report jmeter-report-open jmeter-load-report jmeter-load-report-open \
	gatling-report gatling-report-open gatling-load-report gatling-load-report-open \
	k6-report k6-report-open k6-load-report k6-load-report-open

help: ## show available commands
	@printf "$(GREEN)ProjectTrace commands$(RESET)\n"
	@awk 'BEGIN {FS=":.*##"} /^[a-zA-Z0-9_.-]+:.*##/ {printf "$(GREEN)%-30s$(RESET) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## build and start the container stack
	$(COMPOSE) up --build

test: ## run the quick smoke checks for k6, JMeter, and Gatling
	$(MAKE) ensure-backend-ready
	$(MAKE) k6-report PLAN=smoke-test.js
	$(MAKE) jmeter-report PLAN=smoke-test.jmx
	$(MAKE) gatling-report GATLING_PLAN=smoke-test.gatling.js

up: build ## alias for build

down: ## stop the container stack
	$(COMPOSE) down

migrate: ## apply database migrations
	$(COMPOSE) run --rm backend alembic upgrade head

seed: ## seed realistic sample data
	$(COMPOSE) run --rm backend python -m app.scripts.seed

reset-db: ## reset the database schema
	$(COMPOSE) run --rm backend python -m app.scripts.reset_db

backend: ## run the backend locally in Docker
	$(COMPOSE) run --rm backend uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

frontend: ## run the frontend locally in Docker
	$(COMPOSE) run --rm frontend npm run dev -- --host 0.0.0.0

ensure-backend-ready: ## start the backend stack and wait for /health
	$(COMPOSE) up -d db backend
	@for _ in $$(seq 1 60); do \
		if curl -fsS http://localhost:8000/health >/dev/null; then \
			exit 0; \
		fi; \
		sleep 2; \
	done; \
	echo "Backend did not become healthy in time."; \
	exit 1

ensure-perf-user: ## ensure the canonical perf user exists
	$(COMPOSE) run --rm --build backend python -m app.scripts.ensure_perf_user

ensure-gatling-deps: ## install Gatling JS dependencies if needed
	cd "$(GATLING_DIR)" && if [ ! -d node_modules ]; then npm install; fi

jmeter-report: ## run the JMeter smoke test and build an HTML report
	$(MAKE) ensure-backend-ready
	$(MAKE) ensure-perf-user
	rm -rf "$(REPORT_DIR)"
	mkdir -p "$(REPORT_DIR)"
	$(COMPOSE) --profile perf run --rm jmeter -n -t "$(PLAN_PATH)" -l "$(RESULTS_FILE)" -e -o "$(REPORT_DIR)"
	@echo "JMeter report: $(REPORT_DIR)/index.html"

jmeter-report-open: jmeter-report ## run the JMeter smoke test and open the HTML report
	@if command -v xdg-open >/dev/null 2>&1; then xdg-open "$(REPORT_DIR)/index.html"; else echo "Open $(REPORT_DIR)/index.html manually."; fi

jmeter-load-report: ## run the longer JMeter load test and build an HTML report
	$(MAKE) ensure-backend-ready
	$(MAKE) ensure-perf-user
	rm -rf "$(REPORT_DIR)"
	mkdir -p "$(REPORT_DIR)"
	$(COMPOSE) --profile perf run --rm jmeter -n -t "$(LOAD_PLAN_PATH)" -l "$(RESULTS_FILE)" -e -o "$(REPORT_DIR)"
	@echo "JMeter load report: $(REPORT_DIR)/index.html"

jmeter-load-report-open: jmeter-load-report ## run the longer JMeter load test and open the HTML report
	@if command -v xdg-open >/dev/null 2>&1; then xdg-open "$(REPORT_DIR)/index.html"; else echo "Open $(REPORT_DIR)/index.html manually."; fi

gatling-report: ## run the Gatling smoke test and build an HTML report
	$(MAKE) ensure-backend-ready
	$(MAKE) ensure-perf-user
	$(MAKE) ensure-gatling-deps
	@GATLING_ACCESS_TOKEN=$$($(COMPOSE) exec -T backend python -m app.scripts.print_perf_token); \
	cd "$(GATLING_DIR)" && rm -rf target/gatling && mkdir -p target/gatling && GATLING_ACCESS_TOKEN="$$GATLING_ACCESS_TOKEN" npx gatling run --simulation "$(GATLING_PLAN_NAME)"
	@latest_dir=$$(cd "$(GATLING_DIR)" && find target/gatling -mindepth 1 -maxdepth 1 -type d | sort | tail -n 1); \
	if [ -n "$$latest_dir" ]; then echo "Gatling report: $(GATLING_DIR)/$$latest_dir/index.html"; else echo "Gatling report directory not found."; fi

gatling-report-open: gatling-report ## run the Gatling smoke test and open the HTML report
	@latest_dir=$$(cd "$(GATLING_DIR)" && find target/gatling -mindepth 1 -maxdepth 1 -type d | sort | tail -n 1); \
	if [ -n "$$latest_dir" ] && command -v xdg-open >/dev/null 2>&1; then xdg-open "$(GATLING_DIR)/$$latest_dir/index.html"; \
	else echo "Open $(GATLING_DIR)/$$latest_dir/index.html manually."; fi

gatling-load-report: ## run the Gatling load test and build an HTML report
	$(MAKE) ensure-backend-ready
	$(MAKE) ensure-perf-user
	$(MAKE) ensure-gatling-deps
	@GATLING_ACCESS_TOKEN=$$($(COMPOSE) exec -T backend python -m app.scripts.print_perf_token); \
	cd "$(GATLING_DIR)" && rm -rf target/gatling && mkdir -p target/gatling && GATLING_ACCESS_TOKEN="$$GATLING_ACCESS_TOKEN" npx gatling run --simulation "$(GATLING_LOAD_PLAN_NAME)"
	@latest_dir=$$(cd "$(GATLING_DIR)" && find target/gatling -mindepth 1 -maxdepth 1 -type d | sort | tail -n 1); \
	if [ -n "$$latest_dir" ]; then echo "Gatling load report: $(GATLING_DIR)/$$latest_dir/index.html"; else echo "Gatling load report directory not found."; fi

gatling-load-report-open: gatling-load-report ## run the Gatling load test and open the HTML report
	@latest_dir=$$(cd "$(GATLING_DIR)" && find target/gatling -mindepth 1 -maxdepth 1 -type d | sort | tail -n 1); \
	if [ -n "$$latest_dir" ] && command -v xdg-open >/dev/null 2>&1; then xdg-open "$(GATLING_DIR)/$$latest_dir/index.html"; \
	else echo "Open $(GATLING_DIR)/$$latest_dir/index.html manually."; fi

k6-report: ## run the k6 smoke test and build an HTML report
	$(MAKE) ensure-backend-ready
	$(MAKE) ensure-perf-user
	rm -rf "$(K6_REPORT_DIR)"
	mkdir -p "$(K6_REPORT_DIR)"
	$(COMPOSE) --profile perf run --rm k6 run "$(K6_PLAN_PATH)"
	@echo "k6 report: $(K6_REPORT_DIR)/index.html"

k6-report-open: k6-report ## run the k6 smoke test and open the HTML report
	@if command -v xdg-open >/dev/null 2>&1; then xdg-open "$(K6_REPORT_DIR)/index.html"; else echo "Open $(K6_REPORT_DIR)/index.html manually."; fi

k6-load-report: ## run the k6 load test and build an HTML report
	$(MAKE) ensure-backend-ready
	$(MAKE) ensure-perf-user
	rm -rf "$(K6_REPORT_DIR)"
	mkdir -p "$(K6_REPORT_DIR)"
	$(COMPOSE) --profile perf run --rm k6 run "$(K6_LOAD_PLAN_PATH)"
	@echo "k6 load report: $(K6_REPORT_DIR)/index.html"

k6-load-report-open: k6-load-report ## run the k6 load test and open the HTML report
	@if command -v xdg-open >/dev/null 2>&1; then xdg-open "$(K6_REPORT_DIR)/index.html"; else echo "Open $(K6_REPORT_DIR)/index.html manually."; fi
