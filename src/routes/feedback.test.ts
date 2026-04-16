import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildApp } from '../app.js';

// Mock dependencies to avoid actual DB/WS/AI calls during test
vi.mock('../db.js', () => ({
  db: {
    query: vi.fn(),
  },
}));

vi.mock('../ws.js', () => ({
  broadcastFeedbackUpdate: vi.fn(),
  registerWebSocketHandler: vi.fn(),
}));

vi.mock('../ai.js', () => ({
  analyzeFeedbackAsync: vi.fn().mockResolvedValue(undefined),
}));

describe('Feedback Routes Validation', () => {
  let app: any;

  beforeEach(async () => {
    app = await buildApp();
  });

  it('should return 400 if feedback contains script tags', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/feedback',
      payload: {
        text: 'Hello <script>alert(1)</script>',
      },
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toContain('Security Warning');
  });

  it('should return 400 if feedback contains HTML tags like <div>', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/feedback',
      payload: {
        text: 'Hello <div>malicious content</div>',
      },
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toContain('Security Warning');
  });

  it('should return 400 if feedback contains event handlers like onclick', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/feedback',
      payload: {
        text: 'Clean text <img src=x onerror=alert(1)>',
      },
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.error).toContain('Security Warning');
  });

  it('should return 200 for clean feedback text', async () => {
    const { db } = await import('../db.js');
    (db.query as any).mockResolvedValueOnce({
      rows: [{
        id: 1,
        text: 'Excellent product!',
        status: 'RECEIVED',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sentiment: null,
        feature_group: null
      }]
    });

    const response = await app.inject({
      method: 'POST',
      url: '/feedback',
      payload: {
        text: 'Excellent product!',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.text).toBe('Excellent product!');
  });
});
