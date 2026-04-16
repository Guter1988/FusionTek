import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeFeedbackAsync } from './ai.js';
import { db } from './db.js';
import { broadcastFeedbackUpdate } from './ws.js';
import OpenAI from 'openai';

// Mock dependencies
vi.mock('./db.js', () => ({
  db: {
    query: vi.fn(),
  },
}));

vi.mock('./ws.js', () => ({
  broadcastFeedbackUpdate: vi.fn(),
}));

// Mock OpenAI
vi.mock('openai', () => {
  const mockCreate = vi.fn();
  return {
    default: vi.fn().mockImplementation(function() {
      return {
        chat: {
          completions: {
            create: mockCreate,
          },
        },
      };
    }),
  };
});

describe('AI Analysis Service Tests', () => {
  let mockOpenAI: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockOpenAI = new OpenAI() as any;
  });

  it('should successfully analyze feedback and save to database', async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              sentiment: 'POSITIVE',
              feature_requests: [{ feature: 'Speed', confidence: 0.9 }],
              actionable_insight: 'Keep it up',
              primary_feature_group: 'Performance',
            }),
          },
        },
      ],
    };

    // Correctly mock the specific instance's method
    const aiInstance = (OpenAI as any).mock.results[0].value;
    aiInstance.chat.completions.create.mockResolvedValue(mockResponse);

    await analyzeFeedbackAsync(1, 'I love how fast this is!');

    // Check if DB was updated with correct status 'DONE' and results
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE feedback SET"),
      expect.arrayContaining(['POSITIVE', 'Performance', 'DONE'])
    );

    // Check if features were inserted
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO features"),
      [1, 'Speed', 0.9]
    );

    // Check if broadcast was called with DONE status and data
    expect(broadcastFeedbackUpdate).toHaveBeenCalledWith({
      id: 1,
      status: 'DONE',
      sentiment: 'POSITIVE',
      group: 'Performance',
    });
  });

  it('should throw error and NOT update status to FAILED on OpenAI error', async () => {
    const aiInstance = (OpenAI as any).mock.results[0].value;
    aiInstance.chat.completions.create.mockRejectedValue(new Error('API Error'));

    await expect(analyzeFeedbackAsync(1, 'Some text')).rejects.toThrow('API Error');

    // DB should NOT have been updated to FAILED in this function
    expect(db.query).not.toHaveBeenCalledWith(
      expect.stringContaining("UPDATE feedback SET status = 'FAILED'"),
      expect.any(Array)
    );
  });

  it('should throw error on malformed JSON response', async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: 'Invalid JSON',
          },
        },
      ],
    };

    const aiInstance = (OpenAI as any).mock.results[0].value;
    aiInstance.chat.completions.create.mockResolvedValue(mockResponse);

    await expect(analyzeFeedbackAsync(1, 'Some text')).rejects.toThrow('Invalid AI response format');
  });
});
