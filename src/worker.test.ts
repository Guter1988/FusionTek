import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processReceived, processStale } from './worker.js';
import { db } from './db.js';
import { analyzeFeedbackAsync } from './ai.js';
import { broadcastFeedbackUpdate } from './ws.js';

// Mock dependencies
vi.mock('./db.js', () => ({
  db: {
    query: vi.fn(),
  },
}));

vi.mock('./ai.js', () => ({
  analyzeFeedbackAsync: vi.fn(),
}));

vi.mock('./ws.js', () => ({
  broadcastFeedbackUpdate: vi.fn(),
}));

describe('Background Worker Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processReceived', () => {
    it('should pick up RECEIVED rows and move them to ANALYZING', async () => {
      // Mock finding one RECEIVED row
      (db.query as any).mockResolvedValueOnce({
        rows: [{ id: 1, text: 'Test feedback' }],
      });

      await processReceived();

      // Check if status was updated
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE feedback SET status = 'ANALYZING'"),
        [1]
      );

      // Check if broadcast was called
      expect(broadcastFeedbackUpdate).toHaveBeenCalledWith({
        id: 1,
        status: 'ANALYZING',
        sentiment: null,
        group: null,
      });

      // Check if analysis was triggered
      expect(analyzeFeedbackAsync).toHaveBeenCalledWith(1, 'Test feedback');
    });

    it('should stay in ANALYZING if AI analysis fails (for retry)', async () => {
      (db.query as any).mockResolvedValueOnce({
        rows: [{ id: 2, text: 'Fail case' }],
      });
      (analyzeFeedbackAsync as any).mockRejectedValueOnce(new Error('AI Engine Down'));

      await processReceived();

      // Status should have been set to ANALYZING
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE feedback SET status = 'ANALYZING'"),
        [2]
      );

      // But should NOT be updated to FAILED here (handled by stale logic)
      expect(db.query).not.toHaveBeenCalledWith(
        expect.stringContaining("UPDATE feedback SET status = 'FAILED'"),
        expect.any(Array)
      );
    });
  });

  describe('processStale', () => {
    it('should retry a stale row if retry_count < 5', async () => {
      // Mock finding one stale ANALYZING row with retry_count 0
      (db.query as any).mockResolvedValueOnce({
        rows: [{ id: 3, text: 'Stale feedback', retry_count: 0 }],
      });

      await processStale();

      // Check if retry_count was incremented
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE feedback SET retry_count = $1"),
        [1, 3]
      );

      // Check if analysis was re-triggered
      expect(analyzeFeedbackAsync).toHaveBeenCalledWith(3, 'Stale feedback');
    });

    it('should mark row as FAILED if retry_count >= 5', async () => {
      // Mock finding one stale ANALYZING row with retry_count 5
      (db.query as any).mockResolvedValueOnce({
        rows: [{ id: 4, text: 'Max retried feedback', retry_count: 5 }],
      });

      await processStale();

      // Check if status was set to FAILED
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE feedback SET status = 'FAILED'"),
        [4]
      );

      // Check if broadcast was called
      expect(broadcastFeedbackUpdate).toHaveBeenCalledWith({
        id: 4,
        status: 'FAILED',
        sentiment: null,
        group: null,
      });

      // Analysis should NOT be triggered
      expect(analyzeFeedbackAsync).not.toHaveBeenCalled();
    });
  });
});
