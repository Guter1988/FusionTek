import { FastifyInstance } from 'fastify';
import { FeedbackRepository } from '../repositories/feedbackRepository.js';
import { feedbackInputSchema } from '../schemas/feedback.js';

export async function feedbackRoutes(fastify: FastifyInstance) {
  const repo = new FeedbackRepository();

  fastify.post('/feedback', async (request, reply) => {
    const data = feedbackInputSchema.parse(request.body);
    const item = await repo.create(data.content);
    return item;
  });

  fastify.get('/feedbacks', async () => {
    const list = await repo.findAll();
    return list;
  });

  fastify.get('/feedback/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const item = await repo.findById(parseInt(id));
    if (!item) {
      return reply.code(404).send({ error: 'Feedback not found' });
    }
    return item;
  });
}
