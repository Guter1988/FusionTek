import { WebSocket } from 'ws';

export class WebsocketHub {
  private static instance: WebsocketHub;
  private clients: Set<WebSocket> = new Set();

  private constructor() {}

  static getInstance(): WebsocketHub {
    if (!WebsocketHub.instance) {
      WebsocketHub.instance = new WebsocketHub();
    }
    return WebsocketHub.instance;
  }

  addClient(socket: WebSocket) {
    this.clients.add(socket);
    socket.on('close', () => {
      this.clients.delete(socket);
    });
    socket.on('error', () => {
      this.clients.delete(socket);
      socket.terminate();
    });
  }

  broadcast(message: any) {
    const data = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(data);
        } catch (e) {
          console.error('Failed to send WS message', e);
        }
      }
    });
  }
}
