VENV := backend/venv
PYTHON := $(VENV)/bin/python
PIP := $(VENV)/bin/pip
PYTEST := $(VENV)/bin/pytest
UVICORN := $(VENV)/bin/uvicorn

.PHONY: install venv dev-backend dev-frontend test test-backend test-frontend qr lint help

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
	@echo "  qr             Generate QR code PNGs in backend/qr_codes/"
	@echo "  lint           Run frontend ESLint"

install: venv
	cd frontend && npm install

venv:
	python3 -m venv $(VENV)
	$(PIP) install -r backend/requirements.txt

dev-backend: venv
	cd backend && $(abspath $(UVICORN)) main:app --reload

dev-frontend:
	cd frontend && npm run dev

test: test-backend test-frontend

test-backend: venv
	cd backend && $(abspath $(PYTEST))

test-frontend:
	cd frontend && npm test

qr: venv
	cd backend && $(abspath $(PYTHON)) qr_generator.py

lint:
	cd frontend && npm run lint
