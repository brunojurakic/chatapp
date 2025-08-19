# Flow

A full‑stack chat application under active development. Current features include managing user accounts and settings, friend management and real‑time direct messaging with persistent storage.

🔗 **Live demo**: https://tryflow.vercel.app  
> ⚠️ The backend is hosted on a free tier, so initial cold starts may take up to 10 seconds.



## Current features

- User authentication (JWT + Google Oauth2)
- Friends system
  - Send friend requests
  - Accept / reject incoming requests
  - Unfriend (removes friendship and related chat data)
- Real‑time direct messages between friends
  - WebSocket server (Spring STOMP) on the backend
  - SockJS + @stomp/stompjs client on the frontend
  - Messages persisted in database
- Account settings management

## Architecture & Technologies

- Backend
  - Java + Spring Boot
  - Spring Security (JWT)
  - Spring WebSocket + STOMP
  - Spring Data JPA (Hibernate)
  - Maven

- Frontend
  - React
  - Typescript
  - Vite
  - TailwindCSS
  - SockJS + @stomp/stompjs for websockets

- Database
  - PostgreSQL

- File Storage
  - Vercel Blob
