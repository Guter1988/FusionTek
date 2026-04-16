# FusionTek - Feedback Analysis Platform

A full-stack feedback analysis application with a real-time analytics dashboard and integrated local AI analysis.

## Project Overview
FusionTek provides a complete system for capturing, analyzing, and monitoring user feedback. This repository includes:
- **AI Analysis**: Automated sentiment analysis, feature extraction, and actionable insights using local LLMs.
- **Backend**: High-performance Node.js server using Fastify and TypeScript.
- **Frontend**: Premium "Glassmorphism" UI built with vanilla HTML, CSS, and JS.
- **Database**: PostgreSQL 15+ containerized with Docker Compose.
- **Real-time**: Live updates via WebSockets for feedback status and sentiment changes.

## System Architecture
- **API Server**: Fastify (listening on port 3000).
- **AI Engine**: Ollama (OpenAI-compatible local API) running Llama 3.1.
- **Database**: PostgreSQL (accessible via `db:5432` in Docker or `localhost:5432` locally).
- **Communication**: REST API + WebSockets for live updates.

## Tech Stack
- **Languages**: TypeScript, JavaScript (ESM)
- **AI**: Ollama, OpenAI Node.js SDK, Zod (validation)
- **Framework**: Fastify
- **Database**: PostgreSQL with `pg` pool
- **Real-time**: `@fastify/websocket`
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

### 3. Access the App
The scripts above will open your browser automatically. If you run manually, access:
- Dashboard: [http://localhost:3000/](http://localhost:3000/)
- Feedback Details: [http://localhost:3000/feedback.html](http://localhost:3000/feedback.html)

## API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/feedback` | `POST` | Submit feedback (triggers async AI analysis) |
| `/feedbacks` | `GET` | List all feedback (sorted by newest) |
| `/feedback/:id` | `GET` | Get detailed feature analysis for an ID |
| `/ws` | `WS` | Real-time update stream |

## Development Log
- **2026-04-16 20:02:22**: Initialized PostgreSQL setup using Docker Compose.
- **2026-04-16 20:11:10**: Designed SQL schema with `feedback` and `features` tables.
- **2026-04-16 21:22:19**: Developed modern vanilla JS frontend with real-time updates.
- **2026-04-16 21:36:57**: Implemented full Node.js backend using Fastify and TypeScript.
- **2026-04-16 21:57:30**: Added automation scripts (`runme.sh` and `runme.cmd`).
- **2026-04-16 22:02:10**: Integrated local LLM container (Ollama) for asynchronous multilingual analysis.
- **2026-04-16 22:03:00**: Implemented strict JSON extraction with Zod validation and background processing.

