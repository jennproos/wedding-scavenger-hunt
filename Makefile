-include .env
export

VENV := backend/venv
PYTHON := $(VENV)/bin/python
PIP := $(VENV)/bin/pip
PYTEST := $(VENV)/bin/pytest
UVICORN := $(VENV)/bin/uvicorn

INFRA_VENV := infra/.venv
INFRA_PIP := $(INFRA_VENV)/bin/pip

.PHONY: install venv infra-venv dev-backend dev-frontend test test-backend test-frontend lint deploy-frontend deploy-backend help

help:
	@echo "Usage: make <target>"
	@echo ""
	@echo "Setup"
	@echo "  install        Create venv, install backend deps, install frontend deps"
	@echo "  venv           Create Python venv and install backend deps only"
	@echo ""
	@echo "Dev (open two terminals)"
	@echo "  dev-backend    Start FastAPI dev server on :8000"
	@echo "  dev-frontend   Start Vite dev server on :5173"
	@echo ""
	@echo "Test"
	@echo "  test           Run all tests (backend + frontend)"
	@echo "  test-backend   Run backend pytest"
	@echo "  test-frontend  Run frontend vitest"
	@echo ""
	@echo "Other"
	@echo "  lint           Run frontend ESLint"
	@echo "  deploy-frontend Build and deploy frontend to S3 + CloudFront"
	@echo "  deploy-backend  SSH deploy backend and restart service"

install: venv
	cd frontend && npm install

venv:
	python3 -m venv $(VENV)
	$(PIP) install -r backend/requirements.txt

infra-venv:
	python3 -m venv $(INFRA_VENV)
	$(INFRA_PIP) install -r infra/requirements.txt -r infra/requirements-dev.txt

dev-backend: venv infra-venv
	cd backend && $(abspath $(UVICORN)) main:app --reload

dev-frontend:
	cd frontend && npm run dev

test: test-backend test-frontend

test-backend: venv
	cd backend && $(abspath $(PYTEST))

test-frontend:
	cd frontend && npm test

lint:
	cd frontend && npm run lint

deploy-frontend:
	./scripts/deploy-frontend.sh

deploy-backend:
	./scripts/deploy-backend.sh
