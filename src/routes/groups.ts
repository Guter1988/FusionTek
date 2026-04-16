import { FastifyInstance } from 'fastify';
import { GroupRepository } from '../repositories/groupRepository.js';

export async function groupRoutes(fastify: FastifyInstance) {
  const repo = new GroupRepository();

  fastify.get('/groups', async () => {
    return await repo.getClusterStats();
  });
}
