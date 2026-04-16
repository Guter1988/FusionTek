
import { buildApp } from '../src/app.js';
import { db } from '../src/db.js';

async function runVerification() {
  const app = await buildApp();
  
  const testCases = [
    { name: 'English', text: 'Hello world' },
    { name: 'Hebrew', text: 'שלום עולם' },
    { name: 'Arabic', text: 'مرحبا بالعالم' },
    { name: 'Japanese', text: 'こんにちは世界' },
    { name: 'Chinese', text: '你好，世界' },
    { name: 'Russian', text: 'Привет мир' },
    { name: 'Hindi', text: 'नमस्ते दुनिया' },
    { name: 'Emoji', text: '🚀🔥😊' },
    { name: 'Mixed', text: 'שלום world こんにちは 🚀' },
  ];

  console.log('--- Unicode Verification Start ---');

  for (const tc of testCases) {
    console.log(`Testing ${tc.name}: "${tc.text}"`);

    // 1. Submit to API
    const postRes = await app.inject({
      method: 'POST',
      url: '/feedback',
      payload: { text: tc.text },
    });

    if (postRes.statusCode !== 200) {
      console.error(`  [FAILED] POST /feedback returned ${postRes.statusCode}`);
      continue;
    }

    const posted = JSON.parse(postRes.body);
    if (posted.text === tc.text) {
      console.log(`  [PASSED] API Round-trip`);
    } else {
      console.error(`  [FAILED] API Round-trip: Expected "${tc.text}", got "${posted.text}"`);
    }

    // 2. Verify in DB
    const dbRes = await db.query('SELECT text FROM feedback WHERE id = $1', [posted.id]);
    const dbText = dbRes.rows[0].text;
    if (dbText === tc.text) {
      console.log(`  [PASSED] DB Storage`);
    } else {
      console.error(`  [FAILED] DB Storage: Expected "${tc.text}", got "${dbText}"`);
    }

    // 3. Verify via GET /feedbacks
    const getRes = await app.inject({
      method: 'GET',
      url: '/feedbacks',
    });
    const feedbacks = JSON.parse(getRes.body);
    const found = feedbacks.find((f: any) => f.id === posted.id);
    if (found && found.text === tc.text) {
      console.log(`  [PASSED] GET /feedbacks`);
    } else {
      console.error(`  [FAILED] GET /feedbacks mismatch`);
    }
  }

  console.log('--- Unicode Verification End ---');
  process.exit(0);
}

runVerification().catch(err => {
  console.error(err);
  process.exit(1);
});
