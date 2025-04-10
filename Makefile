default: help

.PHONY: install
install:
	@echo "Installing dependencies..."
	@npm install
	@echo "Dependencies installed."

.PHONY: build
build: install
	@echo "Building the project..."
	@npm run build

.PHONY: dev
dev: install
	@echo "Starting development server..."
	@npm run dev

.PHONY: clean
clean:
	@echo "Cleaning up..."
	@rm -rf node_modules
	@rm -rf dist
	@echo "Cleaned up."

.PHONY: test-unit
test-unit: install
	@echo "Running unit tests..."
	@npm run test:unit

.PHONY: test-unit-watch
test-unit-watch: install
	@echo "Running unit tests in watch mode..."
	@npm run test:unit:watch

.PHONY: test-coverage
test-coverage: install
	@echo "Running tests with coverage..."
	@npm run test:coverage

.PHONY: test-e2e
test-e2e: install
	@echo "Running end-to-end tests..."
	@npm run test:e2e

.PHONY: test-e2e-ui
test-e2e-ui: install
	@echo "Running end-to-end tests with UI..."
	@npm run test:e2e:ui

.PHONY: test
test: test-unit test-e2e
	@echo "All tests completed."

.PHONY: help
help:
	@echo "Available commands:"
	@echo ""
	@echo "    make install       - Install dependencies"
	@echo "    make build         - Build the project"
	@echo "    make dev           - Start development server"
	@echo "    make help          - Show this help message"
	@echo "    make clean         - Clean up the project"
	@echo "    make test          - Run all tests (unit and e2e)"
	@echo "    make test-unit     - Run unit tests"
	@echo "    make test-unit-watch - Run unit tests in watch mode"
	@echo "    make test-coverage - Run tests with coverage report"
	@echo "    make test-e2e      - Run end-to-end tests"
	@echo "    make test-e2e-ui   - Run end-to-end tests with UI"