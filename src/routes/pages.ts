import { FastifyInstance } from 'fastify';
import path from 'path';
import { config } from '../config.js';

export async function pageRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    return reply.sendFile('index.html');
  });

  app.get('/feedback.html', async (request, reply) => {
    return reply.sendFile('feedback.html');
  });
}
