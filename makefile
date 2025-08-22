dev-java:
	cd backend && dotenv -- mvn spring-boot:run

dev-vite:
	cd frontend && npm run dev

docker-build:
	docker build -t chatapp-backend ./backend

docker-run:
	docker run --env-file ./backend/.env -p 8080:8080 chatapp-backend

format:
	cd frontend && npm run format
	cd backend && mvn spotless:apply

lint:
	cd frontend && npm run lint
	cd frontend && npm run build