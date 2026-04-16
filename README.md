# FusionTek - Feedback Analysis Platform

A full-stack feedback analysis application with a real-time analytics dashboard.

## Project Overview
FusionTek provides a complete system for capturing, analyzing, and monitoring user feedback. This repository includes:
- **Backend**: High-performance Node.js server using Fastify and TypeScript.
- **Frontend**: Premium "Glassmorphism" UI built with vanilla HTML, CSS, and JS.
- **Database**: PostgreSQL 15+ containerized with Docker Compose.
- **Real-time**: Live updates via WebSockets for feedback status and sentiment changes.

## System Architecture
- **API Server**: Fastify (listening on port 3000).
- **Database**: PostgreSQL (accessible via `db:5432` in Docker or `localhost:5432` locally).
- **Communication**: REST API for data operations + WebSockets for live dashboard updates.

## Tech Stack
- **Languages**: TypeScript, JavaScript (ESM)
- **Framework**: Fastify
- **Database**: PostgreSQL with `pg` pool
- **Real-time**: `@fastify/websocket`
- **Styling**: Vanilla CSS (Custom Properties, Flexbox, Grid, Glassmorphism)
- **Infrastructure**: Docker, Docker Compose

## Quick Start

### 1. Prerequisites
- Docker & Docker Compose

### 2. Run Everything
The entire stack (Frontend + Backend + Database) is containerized. Simply run:
```bash
docker-compose up --build
```

### 3. Access the App
Open your browser at:
- Dashboard: [http://localhost:3000/](http://localhost:3000/)
- Feedback Details: [http://localhost:3000/feedback.html](http://localhost:3000/feedback.html)

## API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/feedback` | `POST` | Submit new feedback text |
| `/feedbacks` | `GET` | List all feedback (sorted by newest) |
| `/feedback/:id` | `GET` | Get detailed feature analysis for an ID |
| `/ws` | `WS` | Real-time update stream |

## Development Log
- **2026-04-16 20:02:22**: Initialized PostgreSQL setup using Docker Compose.
- **2026-04-16 20:11:10**: Designed SQL schema with `feedback` and `features` tables.
- **2026-04-16 21:22:19**: Developed modern vanilla JS frontend with real-time updates.
- **2026-04-16 21:36:57**: Implemented full Node.js backend using Fastify and TypeScript.
- **2026-04-16 21:43:20**: Configured environment variables and static file serving.
