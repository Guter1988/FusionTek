import { FastifyInstance } from 'fastify';

// Temporarily using any for the connection type to resolve export mismatch in v10
const connections = new Set<any>();

export function registerWebSocketHandler(app: FastifyInstance) {
  app.get('/ws', { websocket: true }, (connection, req) => {
    connections.add(connection);
    
    connection.socket.on('close', () => {
      connections.delete(connection);
    });

    connection.socket.on('error', (err: Error) => {
      console.error('WebSocket error:', err);
      connections.delete(connection);
    });
  });
}

export function broadcastFeedbackUpdate(update: {
  id: number;
  status: string;
  sentiment: string | null;
  group: string | null;
}) {
  const message = JSON.stringify(update);
  for (const connection of connections) {
    if (connection.socket.readyState === 1) { // 1 = OPEN
      try {
        connection.socket.send(message);
      } catch (err: any) {
        console.error('Failed to send WS message:', err);
        connections.delete(connection);
      }
    }
  }
}
