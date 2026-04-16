# FusionTek - Feedback Analysis Platform

A full-stack feedback analysis application with a real-time analytics dashboard and integrated local AI analysis.

## Project Overview
FusionTek provides a complete system for capturing, analyzing, and monitoring user feedback. This repository includes:
- **AI Analysis**: Automated sentiment analysis, feature extraction, and actionable insights using local LLMs.
- **Backend**: High-performance Node.js server using Fastify and TypeScript.
- **Frontend**: Premium "Glassmorphism" UI built with vanilla HTML, CSS, and JS.
- **Database**: PostgreSQL 15+ containerized with Docker Compose.
- **Real-time**: Live updates via WebSockets for feedback status and sentiment changes.
- **Security**: Built-in protection against HTML/JS injection (XSS) using strict sanitization.
- **Testing**: Integrated test suite for API validation and core logic.

## System Architecture
- **API Server**: Fastify (listening on port 3000).
- **AI Engine**: Ollama (OpenAI-compatible local API) running Llama 3.1.
- **Database**: PostgreSQL (accessible via `db:5432` in Docker or `localhost:5432` locally).
- **Communication**: REST API + WebSockets for live updates.
- **Testing**: Vitest for unit and integration testing.

## Tech Stack
- **Languages**: TypeScript, JavaScript (ESM)
- **AI**: Ollama, OpenAI Node.js SDK, Zod (validation)
- **Framework**: Fastify
- **Database**: PostgreSQL with `pg` pool
- **Real-time**: `@fastify/websocket`
- **Security**: `xss` library (strict mode)
- **Testing**: `vitest`
- **Styling**: Vanilla CSS (Custom Properties, Flexbox, Grid, Glassmorphism)
- **Infrastructure**: Docker, Docker Compose

## Quick Start

### 1. Prerequisites
- Docker & Docker Compose

### 2. Run Everything
We provide convenient scripts to start the environment and open the browser automatically. On first run, it will automatically pull the Llama 3.1 model (approx. 4.7GB).

**On Windows (CMD/PowerShell):**
```cmd
runme.cmd
```

**On Bash (Linux/macOS/Git Bash):**
```bash
./runme.sh
```

Alternatively, run manually: `docker compose up -d`

### 3. Run Tests
The repository includes a suite of tests for ensuring API reliability and security.
```bash
npm test
```

### 4. Access the App
The scripts above will open your browser automatically. If you run manually, access:
- Dashboard: [http://localhost:3000/](http://localhost:3000/)
- Feedback Details: [http://localhost:3000/feedback.html](http://localhost:3000/feedback.html)

## API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/feedback` | `POST` | Submit feedback (triggers async AI analysis + XSS check) |
| `/feedbacks` | `GET` | List all feedback (sorted by newest) |
| `/feedback/:id` | `GET` | Get detailed feature analysis for an ID |
| `/ws` | `WS` | Real-time update stream |

## Security & Validation
The system implements strict input validation:
- **XSS Protection**: Every submission is checked using a zero-trust policy. If any HTML tags or event handlers (like `<script>`, `<div>`, `onclick`) are detected, the request is rejected with a **400 Bad Request**.
- **Schema Validation**: All AI outputs are validated using **Zod** before being stored in the database.

## Development Log
- **2026-04-16 20:02**: Initialized PostgreSQL setup using Docker Compose.
- **2026-04-16 20:11**: Designed SQL schema with `feedback` and `features` tables.
- **2026-04-16 21:22**: Developed modern vanilla JS frontend with real-time updates.
- **2026-04-16 21:36**: Implemented full Node.js backend using Fastify and TypeScript.
- **2026-04-16 22:02**: Integrated local LLM (Ollama) for asynchronous multilingual analysis.
- **2026-04-16 22:03**: Implemented strict JSON extraction with Zod validation.
- **2026-04-16 22:20**: Added background worker with polling-based retry logic.
- **2026-04-16 22:22**: Implemented XSS protection using the `xss` library and added Vitest suite.

## Background Processing & Retry Strategy

The system architecture includes a robust background worker that ensures all submitted feedback is processed by the AI engine, even in the event of transient failures or system load.

### Worker Behavior
- **Polling Loop**: A background worker runs every **1 second** using a safe, non-overlapping recursive `setTimeout` design.
- **New Feedback**: Automatically picks up rows with status `RECEIVED` and moves them to `ANALYZING`.
- **Stale Processing**: Scans for rows that have been stuck in `ANALYZING` for more than **1 minute**, indicating a potential crash or timeout during AI processing.

### Retry Policy
- **Failure Handling**: If an Ollama call fails (e.g., service temporarily down, malformed response), the system does **not** immediately mark the record as `FAILED`. 
- **Automatic Retries**: Stale `ANALYZING` rows are retried up to **5 times**. 
- **Retry Count**: Each attempt increments the `retry_count` column. After 5 failed attempts, the status is finally set to `FAILED`.
- **Visibility**: Status updates (ANALYZING, DONE, FAILED) are broadcast in real-time to all connected clients via WebSockets.

### Design Trade-offs
- **Polling vs. Pub/Sub**: We use a polling model to avoid the complexity of an external queue like Redis or RabbitMQ for this assignment.
- **Why not fail immediately?**: LLM services (especially local ones like Ollama) can be transiently unavailable or slow. Retrying ensures high reliability without manual intervention.
- **Database-locked Worker**: Keeping the worker inside the backend process simplifies deployment, though a separate worker process would be more scalable for extremely high volumes.

