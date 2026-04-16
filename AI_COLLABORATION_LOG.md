# AI Collaboration Log

## 1. AI Tools Used
- **Antigravity**: Principal AI Coding Assistant for end-to-end implementation and architecture.

## 2. Key Prompts
- "Implement a background worker that scans for rows with status = RECEIVED, updates to ANALYZING, and calls Ollama. Include 5x retry logic for stale records."
- "Create a grouping service that takes a canonical label from the LLM and maps it to a database-backed cluster in a deterministic way."
- "Refactor the Fastify app into a clean structure: repositories, services, and routes."

## 3. Rejected AI Output / Corrections
In an early iteration, the AI suggested using `innerHTML` to display the AI-extracted "actionable insight" because it might contain markdown. I rejected this and insisted on using `.textContent` (or a proper markdown parser) to prevent XSS, especially since the "insight" is derived from untrusted user feedback. I also had to correct the LLM's initial suggestion to use `setInterval` for the worker, which can cause overlapping executions; I replaced it with a recursive `setTimeout` pattern for better safety.

## 4. Product Decisions
- **Normalization vs Strings**: Chose to create a `feedback_groups` table with `canonical_key` rather than just storing a string label. This allows for better analytics (member counts) and easier renaming of categories in the future without losing history.
- **Strict Zod Validation**: Decided to fail the LLM step and retry if the JSON doesn't perfectly match the schema, rather than attempting to "heal" or accept partial output. This ensures downstream systems can rely on the data structure.

## 5. Future Improvements
- **Semantic Grouping**: Move from string-based normalization to vector-based clustering (using PGVector) for even better grouping across languages.
- **Admin Dashboard**: A restricted UI for bulk actions and training the grouping model.
- **Observability**: Integrate Prometheus metrics for the background worker to monitor queue depth and model latency.
