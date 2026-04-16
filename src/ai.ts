import OpenAI from 'openai';
import { z } from 'zod';
import { config } from './config.js';
import { db } from './db.js';
import { broadcastFeedbackUpdate } from './ws.js';

// Initialize OpenAI client for Ollama
const openai = new OpenAI({
  baseURL: config.llmApiUrl,
  apiKey: 'ollama', // Not used by Ollama, but required by SDK
});

// Zod schema for structured output validation
const AnalysisSchema = z.object({
  sentiment: z.enum(['POSITIVE', 'NEGATIVE', 'NEUTRAL']),
  feature_requests: z.array(z.object({
    feature: z.string(),
    confidence: z.number().min(0).max(1),
  })),
  actionable_insight: z.string(),
  primary_feature_group: z.string(),
});

type AnalysisResult = z.infer<typeof AnalysisSchema>;

const SYSTEM_PROMPT = `
You are a senior feedback analyst. Analyze the user feedback and return a STRICT JSON object.
The feedback can be in various languages. Translate your analysis to English.

Respond ONLY with JSON matching this structure:
{
  "sentiment": "POSITIVE" | "NEGATIVE" | "NEUTRAL",
  "feature_requests": [
    { "feature": "string", "confidence": number (0-1) }
  ],
  "actionable_insight": "string",
  "primary_feature_group": "string"
}

Constraints:
- Respond ONLY with the JSON block.
- No markdown formatting in the output.
- No extra text.
- Be concise.
`;

export async function analyzeFeedbackAsync(feedbackId: number, text: string) {
  try {
    // 1. Update status to ANALYZING
    await db.query('UPDATE feedback SET status = $1 WHERE id = $2', ['ANALYZING', feedbackId]);
    broadcastFeedbackUpdate({ id: feedbackId, status: 'ANALYZING' });

    // 2. Call local LLM
    const response = await openai.chat.completions.create({
      model: config.llmModel,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
      temperature: 0,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('Empty AI response');

    // 3. Parse and Validate
    let parsed: AnalysisResult;
    try {
      const cleanedContent = content.trim();
      parsed = AnalysisSchema.parse(JSON.parse(cleanedContent));
    } catch (parseError) {
      console.error('AI Output Validation Failed:', content);
      throw new Error('Invalid AI response format');
    }

    // 4. Save results to DB
    await db.query(
      'UPDATE feedback SET sentiment = $1, feature_group = $2, status = $3 WHERE id = $4',
      [parsed.sentiment, parsed.primary_feature_group, 'DONE', feedbackId]
    );

    // Insert individual features
    for (const feat of parsed.feature_requests) {
      await db.query(
        'INSERT INTO features (feedback_id, feature, confidence) VALUES ($1, $2, $3)',
        [feedbackId, feat.feature, feat.confidence]
      );
    }

    // 5. Broadcast update
    broadcastFeedbackUpdate({
      id: feedbackId,
      status: 'DONE',
      sentiment: parsed.sentiment,
      group: parsed.primary_feature_group,
    });

  } catch (error) {
    console.error(`Feedback analysis failed for ID ${feedbackId}:`, error);
    
    // 6. Fail Safely
    await db.query('UPDATE feedback SET status = $1 WHERE id = $2', ['FAILED', feedbackId]);
    broadcastFeedbackUpdate({ id: feedbackId, status: 'FAILED' });
  }
}
