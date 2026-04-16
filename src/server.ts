import { buildApp } from './app.js';
import { config } from './config.js';
import { startWorker } from './worker.js';

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: config.port, host: '0.0.0.0' });
    console.log(`Server listening at http://localhost:${config.port}`);
    
    // Start background worker
    startWorker();
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
