# FusionTek
FusionTek interview project for feedback analysis database setup and frontend UI.

## Project Overview
This repository contains a containerized PostgreSQL environment with an automated schema initialization and a modern vanilla JavaScript frontend for a feedback analysis application.

## System Architecture
- **Backend (Mocked)**: Expected to run on `http://localhost:3000`.
- **Database**: PostgreSQL 15+ in Docker.
- **Frontend**: Vanilla HTML/CSS/JS with real-time WebSocket updates.

## Frontend UI
The application features a modern "Glassmorphism" interface:
- **Dashboard (`index.html`)**: Submit feedback and view an auto-updating list of all entries. Includes real-time updates via WebSockets for state changes (sentiment, grouping).
- **Details View (`feedback.html`)**: Deep-dive into specific feedback items to see feature breakdown and precision scores.

### Technologies
- Plain HTML5 & Semantic Elements
- Vanilla CSS3 (Custom Properties, Flexbox, Grid, Glassmorphism)
- Vanilla JavaScript (Fetch API, WebSocket, DOM API)
- Responsive Design for mobile/desktop support

### How to Run
1. Start the database: `docker-compose up -d`
2. Open `index.html` in your favorite web browser.
3. Ensure the backend server is listening on port 3000 for API and WS connections.

## Development Log
- **2026-04-16 20:02:22**: Initialized PostgreSQL setup using Docker Compose.
- **2026-04-16 20:11:10**: Designed SQL schema with `feedback` and `features` tables using `GENERATED ALWAYS AS IDENTITY`.
- **2026-04-16 20:15:30**: Implemented automated `updated_at` triggers and set default values to `NOW()`.
- **2026-04-16 21:22:15**: Modified `docker-compose.yml` to remove persistent volumes (database resets on every deployment).
- **2026-04-16 21:22:19**: Developed a modern vanilla JS frontend UI with real-time updates and detailed analysis views.
- **2026-04-16 21:27:14**: Updated project documentation and synchronized repository.
- **2026-04-16 21:35:45**: Refined README timestamps to include precise hour, minute, and second formatting.
