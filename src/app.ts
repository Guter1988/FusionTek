import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyWebsocket from '@fastify/websocket';
import { config } from './config.js';
import { feedbackRoutes } from './routes/feedback.js';
import { pageRoutes } from './routes/pages.js';
import { registerWebSocketHandler } from './ws.js';

export async function buildApp() {
  const app = Fastify({
    logger: config.nodeEnv === 'development',
  });

  // Register plugins
  await app.register(fastifyStatic, {
    root: config.publicDir,
    // Enable this to serve files directly from root (e.g. /index.html)
    // while also allowing manual sendFile usage in routes.
    decorateReply: true,
  });

  await app.register(fastifyWebsocket);

  // Register WebSocket
  registerWebSocketHandler(app);

  // Register API routes
  await app.register(feedbackRoutes);

  // Register Page routes
  await app.register(pageRoutes);

  return app;
}
