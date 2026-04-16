import { FastifyInstance } from 'fastify';
import { db } from '../db.js';
import { broadcastFeedbackUpdate } from '../ws.js';
import { analyzeFeedbackAsync } from '../ai.js';
import xss from 'xss';
// Use the default export if available, otherwise use the package itself
const filterXSS = (xss as any).default || xss;

interface FeedbackBody {
  text: string;
}

export async function feedbackRoutes(app: FastifyInstance) {
  // POST /feedback
  app.post<{ Body: FeedbackBody }>('/feedback', async (request, reply) => {
    const { text } = request.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return reply.code(400).send({ error: 'Text is required' });
    }

    // Security Policy: We do NOT block malicious-looking text (XSS/SQLi) at the ingest level.
    // This supports adversarial testing and research. Safety is guaranteed by:
    // 1. Safe rendering in the UI (using textContent).
    // 2. Parameterized queries in the DB.
    // 3. Prompt boundaries in the AI worker.
    console.log(`[Unicode Verify] Received text: "${text}" (length: ${text.length})`);

    const result = await db.query(
      'INSERT INTO feedback (text, status) VALUES ($1, $2) RETURNING *',
      [text, 'RECEIVED']
    );

    const feedback = result.rows[0];



    // Return mapped object to match required response format
    return {
      id: feedback.id,
      text: feedback.text,
      status: feedback.status,
      sentiment: feedback.sentiment,
      group: feedback.feature_group,
      created_at: feedback.created_at,
      updated_at: feedback.updated_at,
    };
  });

  // GET /feedbacks
  app.get('/feedbacks', async () => {
    const result = await db.query(
      'SELECT id, text, status, sentiment, feature_group AS "group", created_at, updated_at FROM feedback ORDER BY created_at DESC'
    );
    return result.rows;
  });

  // GET /feedback/:id
  app.get<{ Params: { id: string } }>('/feedback/:id', async (request, reply) => {
    const { id } = request.params;

    const feedbackCheck = await db.query('SELECT id FROM feedback WHERE id = $1', [id]);
    if (feedbackCheck.rows.length === 0) {
      return reply.code(404).send({ error: 'Feedback not found' });
    }

    const result = await db.query(
      'SELECT feature, confidence FROM features WHERE feedback_id = $1',
      [id]
    );

    // Matching response: [{ feature: "string", precision: 0.95 }]
    // Note: The prompt used "precision" in the example array, but "confidence" in the text and DB.
    // I will map confidence to precision for the response if the user explicitly asked for that field name.
    return result.rows.map(row => ({
      feature: row.feature,
      precision: row.confidence
    }));
  });

  // Example placeholder route to show broadcasting
  app.patch<{ Params: { id: string }; Body: { status: string; sentiment?: string; group?: string } }>(
    '/feedback/:id/status',
    async (request) => {
      const { id } = request.params;
      const { status, sentiment, group } = request.body;
      
      const result = await db.query(
        'UPDATE feedback SET status = COALESCE($1, status), sentiment = COALESCE($2, sentiment), feature_group = COALESCE($3, feature_group) WHERE id = $4 RETURNING *',
        [status, sentiment || null, group || null, id]
      );

      if (result.rows.length > 0) {
        const updated = result.rows[0];
        broadcastFeedbackUpdate({
          id: updated.id,
          status: updated.status,
          sentiment: updated.sentiment,
          group: updated.feature_group,
        });
        return updated;
      }
      return { error: 'Not found' };
    }
  );
}
