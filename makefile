dev:
	cd backend && dotenv -- mvn spring-boot:run

docker-build:
	docker build -t chatapp-backend ./backend

docker-run:
	docker run --env-file ./backend/.env -p 8080:8080 chatapp-backend
