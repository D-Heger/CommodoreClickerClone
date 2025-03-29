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

.PHONY: help
help: 
	@echo "Available commands:"
	@echo ""
	@echo "    make install   - Install dependencies"
	@echo "    make build     - Build the project"
	@echo "    make dev       - Start development server"
	@echo "    make help      - Show this help message"
	@echo "    make clean     - Clean up the project"