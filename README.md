# FusionTek - Feedback Analysis Platform

A full-stack feedback analysis application with a real-time analytics dashboard and integrated local AI analysis.

## Project Overview
FusionTek provides a complete system for capturing, analyzing, and monitoring user feedback. This repository includes:
- **AI Analysis**: Automated sentiment analysis, feature extraction, and actionable insights using local LLMs.
- **Backend**: High-performance Node.js server using Fastify and TypeScript.
- **Frontend**: Premium "Glassmorphism" UI built with vanilla HTML, CSS, and JS.
- **Database**: PostgreSQL 15+ containerized with Docker Compose.
- **Real-time**: Live updates via WebSockets for feedback status and sentiment changes.
- **Security**: Robust protection against HTML/JS injection (XSS) via safe rendering and structured AI prompting.
- **Sample Data**: Built-in seeding system with 120+ diverse feedback samples for testing and demos.
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

## Unicode & Multi-Locale Support

The FusionTek platform is fully compatible with Unicode (UTF-8) across the entire stack, ensuring that users can submit feedback in any language or script (Hebrew, Arabic, Japanese, Chinese, Russian, Hindi, Emojis, etc.).

### How it works:
1.  **Frontend**: All HTML pages use `<meta charset="UTF-8">`. UI updates are performed using `textContent` to ensure that Unicode strings are rendered safely and accurately without corrupting special characters or triggering accidental HTML parsing.
2.  **Backend**: The Fastify server handles `application/json` request bodies using UTF-8 encoding by default. The `pg` library manages database communication using UTF-8, preserving the original strings.
3.  **Database**: The PostgreSQL database is configured with `UTF8` encoding. The `text` column type in the `feedback` table is used to store high-fidelity Unicode content.

### End-to-End Verification
Unicode support has been verified end-to-end using the following languages and mixed scripts:
- **Hebrew**: שלום עולם
- **Arabic**: مرحبا بالعالم
- **Japanese**: こんにちは世界
- **Chinese**: 你好，世界
- **Russian**: Привет мир
- **Hindi**: नमस्ते दुनिया
- **Emoji**: 🚀🔥😊
- **Mixed**: שלום world こんにちは 🚀

#### SQL Verification Query
To verify your database encoding, run:
```sql
SELECT datname, pg_encoding_to_char(encoding) as encoding, datcollate, datctype 
FROM pg_database 
WHERE datname = 'feedback_db';
```

#### Automated Verification
A verification script is available in `scripts/verify-unicode.ts`. It performs an end-to-end round-trip test (Submit -> API -> DB -> Fetch) to ensure character integrity.

## Security & Robustness
The system implements a multi-layered approach to security and robustness:
- **Safe Rendering**: All feedback text is rendered using `.textContent` or manual HTML escaping on the frontend. This ensures that HTML/JS payloads (like `<script>` or `<img>` onerror) are displayed as literal text and never executed.
- **Structured Prompting**: User feedback is treated as untrusted data. When sending to the AI, it is wrapped in clear boundaries and the system prompt explicitly instructs the LLM to ignore any instructions within the feedback (defending against prompt injection).
- **Data Integrity**: Adversarial samples (SQL injection text, PII) are stored safely as strings in PostgreSQL without risk of execution or leakage.
- **Schema Validation**: All AI outputs are validated using **Zod** before being stored.

## Development Log
- **2026-04-16 20:02**: Initialized PostgreSQL setup using Docker Compose.
- **2026-04-16 20:11**: Designed SQL schema with `feedback` and `features` tables.
- **2026-04-16 21:22**: Developed modern vanilla JS frontend with real-time updates.
- **2026-04-16 21:36**: Implemented full Node.js backend using Fastify and TypeScript.
- **2026-04-16 22:02**: Integrated local LLM (Ollama) for asynchronous multilingual analysis.
- **2026-04-16 22:03**: Implemented strict JSON extraction with Zod validation.
- **2026-04-16 22:20**: Added background worker with polling-based retry logic.
- **2026-04-16 22:22**: Implemented XSS protection using the `xss` library and added Vitest suite.
- **2026-04-16 22:27**: Integrated 120+ sample feedback items (general, security, and injection).
- **2026-04-16 22:28**: Replaced strict input blocking with safe rendering to support adversarial testing.
- **2026-04-16 22:29**: Improved AI prompt robustness to handle prompt injection attempts.
- **2026-04-16 22:48**: Verified and fixed end-to-end Unicode support (HTML, API, DB).
- **2026-04-16 22:49**: Refactored frontend to use `textContent` for safe, high-fidelity script rendering.

## Sample Data & Seeding
The project includes a structured set of sample data to demonstrate system capabilities:
- **General (100 samples)**: Positive, negative, feature requests, and multilingual inputs (French, Spanish, German, Japanese, Hebrew).
- **Security Risks (10 samples)**: Prompt injection attempts, SQL injection text, and PII leakage examples.
- **Injection Payloads (10 samples)**: HTML and JavaScript payloads to verify safe rendering.

### Seeding the Database
To populate your local database with these samples:
```bash
npm run seed:samples
```
*Note: The script is idempotent; it checks for existing text before inserting to avoid duplicates.*

## AI Collaboration Log - Decisions & Rationale
| Date | Decision | Rationale |
| :--- | :--- | :--- |
| 2026-04-16 | **Safe Rendering > Input Blocking** | To support adversarial testing and research, we transitioned from blocking suspicious strings (like `<script>`) to safe, escaped rendering. This allows the system to process "malicious-looking" feedback while remaining perfectly secure. |
| 2026-04-16 | **Prompt Boundaries** | Added explicit `--- FEEDBACK START ---` markers and system-level instructions to treat user input as raw data, mitigating "ignore previous instructions" attacks. |
| 2026-04-16 | **Rejected Suggestion** | **AI Suggestion**: "We should use a Regex to block all inputs containing 'SELECT' or 'DROP TABLE'."<br>**Resolution**: Rejected. Simple keyword blocking is fragile and prevents users from writing feedback *about* SQL-related issues. Instead, we use parameterized queries and safe rendering. |

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

