import { db } from './db.js';
import { analyzeFeedbackAsync } from './ai.js';
import { broadcastFeedbackUpdate } from './ws.js';

/**
 * Background worker that processes feedback rows.
 * Handles initial analysis and retries for stale processing attempts.
 */

export async function processReceived() {
  // Find rows that haven't been picked up yet
  const result = await db.query(
    "SELECT id, text FROM feedback WHERE status = 'RECEIVED' ORDER BY created_at ASC LIMIT 10"
  );
  
  for (const row of result.rows) {
    try {
      console.log(`[Worker] Picking up new feedback ID ${row.id}`);
      
      // Update status to ANALYZING immediately to prevent other worker instances 
      // (if any were running) from picking it up, and to signal progress.
      await db.query(
        "UPDATE feedback SET status = 'ANALYZING', updated_at = NOW() WHERE id = $1",
        [row.id]
      );
      broadcastFeedbackUpdate({ id: row.id, status: 'ANALYZING', sentiment: null, group: null });
      
      // Attempt AI analysis
      await analyzeFeedbackAsync(row.id, row.text);
    } catch (err) {
      console.error(`[Worker] Error processing RECEIVED row ${row.id}:`, err.message);
      // NOTE: We do NOT change status to FAILED here. 
      // The row stays in ANALYZING and will be retried by processStale() after 1 minute.
    }
  }
}

export async function processStale() {
  // Find rows that have been in ANALYZING for more than 1 minute
  const result = await db.query(
    `SELECT id, text, retry_count FROM feedback 
     WHERE status = 'ANALYZING' 
     AND updated_at < NOW() - INTERVAL '1 minute'
     ORDER BY updated_at ASC LIMIT 10`
  );

  for (const row of result.rows) {
    try {
      if (row.retry_count >= 5) {
        console.log(`[Worker] Row ${row.id} exceeded retry limit. Marking as FAILED.`);
        await db.query(
          "UPDATE feedback SET status = 'FAILED', updated_at = NOW() WHERE id = $1",
          [row.id]
        );
        broadcastFeedbackUpdate({ id: row.id, status: 'FAILED', sentiment: null, group: null });
      } else {
        const nextRetry = row.retry_count + 1;
        console.log(`[Worker] Retrying stale row ${row.id} (Attempt ${nextRetry}/5)`);
        
        // Increment retry count and update timestamp
        await db.query(
          "UPDATE feedback SET retry_count = $1, updated_at = NOW() WHERE id = $2",
          [nextRetry, row.id]
        );
        
        // Attempt AI analysis again
        await analyzeFeedbackAsync(row.id, row.text);
      }
    } catch (err) {
      console.error(`[Worker] Error processing stale row ${row.id}:`, err.message);
    }
  }
}

/**
 * Main worker loop. 
 * Uses recursive setTimeout to ensure no two executions overlap.
 */
export async function startWorker() {
  console.log('[Worker] Starting background feedback processor...');
  
  const loop = async () => {
    try {
      await processReceived();
      await processStale();
    } catch (err) {
      console.error('[Worker] Unexpected error in worker loop:', err);
    } finally {
      // Schedule next execution in 1 second
      setTimeout(loop, 1000);
    }
  };

  await loop();
}
