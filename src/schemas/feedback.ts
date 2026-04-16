import { z } from 'zod';

export const feedbackInputSchema = z.object({
  content: z.string().min(1, 'Content is required').max(5000, 'Content too long'),
});

export type FeedbackInput = z.infer<typeof feedbackInputSchema>;

export const analysisOutputSchema = z.object({
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  feature_requests: z.array(z.object({
    title: z.string().min(1).max(100),
    confidence: z.number().min(0).max(1),
  })).max(10), // Limit number of feature requests
  actionable_insight: z.string().min(5).max(500),
  canonical_group_label: z.string().min(2).max(50),
});

export type AnalysisOutput = z.infer<typeof analysisOutputSchema>;
