prod:
	docker-compose up

dev:
	docker-compose -f docker-compose.dev.yml up

build:
	docker-compose -f docker-compose.dev.yml build --no-cache

restart:
	docker-compose -f docker-compose.dev.yml down && docker-compose -f docker-compose.dev.yml build && docker-compose -f docker-compose.dev.yml up

nocache restart:
	docker-compose -f docker-compose.dev.yml down && docker-compose -f docker-compose.dev.yml build --no-cache && docker-compose -f docker-compose.dev.yml up

down:
	docker-compose -f docker-compose.dev.yml down

front:
	cd frontend && npm run dev