import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/feedback_db',
  nodeEnv: process.env.NODE_ENV || 'development',
  publicDir: path.join(process.cwd(), 'public'),
  llmModel: process.env.LLM_MODEL || 'llama3.1',
  llmApiUrl: process.env.LLM_API_URL || 'http://localhost:11434/v1',
};
