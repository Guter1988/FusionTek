import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  const dataDir = path.resolve(__dirname, '../data/sample-feedback');
  const files = ['general.json', 'security.json', 'html-js-injection.json'];

  console.log('🚀 Starting seed process...');

  try {
    for (const file of files) {
      const filePath = path.join(dataDir, file);
      console.log(`\n📂 Processing ${file}...`);
      
      const content = await fs.readFile(filePath, 'utf-8');
      const samples = JSON.parse(content);

      let insertedCount = 0;
      let skippedCount = 0;

      for (const sample of samples) {
        // Idempotency check: see if this exact text already exists
        const checkResult = await db.query('SELECT id FROM feedback WHERE text = $1', [sample.text]);
        
        if (checkResult.rows.length === 0) {
          await db.query(
            'INSERT INTO feedback (text, status, created_at, updated_at) VALUES ($1, $2, NOW(), NOW())',
            [sample.text, 'RECEIVED']
          );
          insertedCount++;
        } else {
          skippedCount++;
        }
      }

      console.log(`✅ ${file}: Inserted ${insertedCount}, Skipped ${skippedCount} duplicates.`);
    }

    console.log('\n✨ Seeding completed successfully!');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
  } finally {
    await db.pool.end();
  }
}

seed();
