import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000'),
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/feedback_db',
  ollamaUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
  modelName: process.env.MODEL_NAME || 'llama3.1',
  workerInterval: parseInt(process.env.WORKER_INTERVAL || '1000'),
  staleTimeoutMs: parseInt(process.env.STALE_TIMEOUT_MS || '60000'),
  maxRetries: parseInt(process.env.MAX_RETRIES || '5'),
};

// Config validation for interview-readiness
const configSchema = z.object({
  port: z.number(),
  databaseUrl: z.string().url(),
  ollamaUrl: z.string().url(),
  modelName: z.string(),
  workerInterval: z.number().min(500),
  staleTimeoutMs: z.number().min(10000),
  maxRetries: z.number().min(0),
});

configSchema.parse(config);
