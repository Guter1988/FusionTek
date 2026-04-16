# FusionTek - Feedback Analysis Platform

A robust, multilingual feedback analysis system powered by a local LLM (Ollama).

## Features
- **Asynchronous Analysis**: Feedback is processed in the background, ensuring a snappy user experience.
- **Strict Structured Output**: AI analysis is validated using Zod to ensure data integrity.
- **Deterministic Grouping**: Similar feedback is automatically clustered into stable categories.
- **Multi-Locale Support**: Full Unicode compatibility for feedback in any script (Hebrew, Arabic, Japanese, etc.).
- **Real-time Updates**: Live dashboard updates via WebSockets as analysis completes.
- **Modern UI**: Clean, glassmorphism-inspired interface built with vanilla JS.

## Tech Stack
- **Backend**: Node.js, TypeScript, Fastify
- **Database**: PostgreSQL
- **AI Engine**: Ollama (Llama 3.1)
- **Validation**: Zod
- **Frontend**: Vanilla HTML/CSS/JS
- **Infrastucture**: Docker Compose

## Getting Started

### 1. Prerequisites
- Docker and Docker Compose installed.

### 2. Run the Application
Start the entire stack with one command:
```bash
docker compose up -d
```
The first run will automatically pull the `llama3.1` model (approx. 4.7GB).

### 3. Seed Sample Data
Populate the database with diverse test cases:
```bash
npm run seed:samples
```

### 4. Access
- **Dashboard**: [http://localhost:3000](http://localhost:3000)

## Design Decisions

### Background Worker & Retry Strategy
We use a polling-based background worker (`src/worker/feedbackWorker.ts`) that runs every 1 second. 
- **Failures**: If Ollama is transiently down, the record stays in `ANALYZING`.
- **Retries**: A stale processing logic picks up records stuck in `ANALYZING` for >1 minute and retries them up to 5 times.
- **Why?**: Polling avoids the need for an external queue (like Redis) while providing robust retry-ability for this scale.

### Grouping Strategy
Grouping is performed deterministically by the `GroupingService`.
1. The AI generates a `canonical_group_label`.
2. The service normalizes this label (lowercase, trimming, alphanumeric-only keys).
3. If an existing group matches the key, it is joined; otherwise, a new group is created.
4. This ensures stable grouping even if phrasing varies slightly.

### Multi-Locale Verification
End-to-end Unicode support is baked into every layer:
- **UI**: `<meta charset="UTF-8">` and `.textContent` for safe rendering.
- **DB**: PostgreSQL initialized with UTF8.
- **AI**: System prompts structured to support multilingual data extraction.
Verified with Hebrew, Arabic, Japanese, Russian, Hindi, and Emojis.

### Security
- **Data vs Instructions**: The AI prompt uses explicit boundaries and system instructions to treat feedback as data, mitigating prompt injection.
- **XSS**: Safe frontend rendering via `textContent` ensures that even if feedback contains `<script>` tags, they are displayed as text and never executed.

## API Summary
- `POST /feedback`: Submit new feedback.
- `GET /feedbacks`: List all feedback with analysis and group info.
- `GET /feedback/:id`: Detailed view of a single feedback item.
- `GET /groups`: Get cluster statistics and member counts.
- `GET /health`: System health check.

## Trade-offs & Future Improvements
- **In-process Worker**: Simple to deploy but doesn't scale horizontally. In a production environment, we would use a distributed queue like RabbitMQ or BullMQ.
- **Model Size**: Llama 3.1 is high quality but heavy. For faster response times, a smaller model like Phil-3 or Mistral could be used.
- **Search**: Adding a full-text search capability in PostgreSQL (pg_trgm) would be the next logical feature.
