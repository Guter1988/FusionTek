import { buildApp } from './app.js';
import { config } from './config.js';
import { FeedbackWorker } from './worker/feedbackWorker.js';

const start = async () => {
  try {
    const app = await buildApp();
    
    // Start Background Worker
    const worker = new FeedbackWorker();
    worker.start();
    console.log('Background worker started');

    await app.listen({ port: config.port, host: '0.0.0.0' });
    console.log(`Server listening on http://localhost:${config.port}`);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

start();
