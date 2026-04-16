import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../src/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  const dataDir = path.join(__dirname, '../data/sample-feedback');
  const files = ['general.json', 'security.json', 'html-js-injection.json'];

  console.log('Seeding feedback samples...');

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const content = await fs.readFile(filePath, 'utf-8');
    const samples = JSON.parse(content);

    for (const sample of samples) {
      // Avoid duplicates based on exact content
      const exists = await pool.query('SELECT 1 FROM feedback WHERE content = $1 LIMIT 1', [sample.text]);
      if (exists.rowCount === 0) {
        await pool.query('INSERT INTO feedback (content, status) VALUES ($1, $2)', [sample.text, 'RECEIVED']);
        console.log(`Inserted: ${sample.text.substring(0, 30)}...`);
      }
    }
  }

  console.log('Seeding complete.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
