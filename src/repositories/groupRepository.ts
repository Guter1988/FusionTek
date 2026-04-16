import { pool } from '../db.js';

export interface GroupRecord {
  id: number;
  label: string;
  canonical_key: string;
  created_at: Date;
}

export class GroupRepository {
  async findByCanonicalKey(key: string): Promise<GroupRecord | null> {
    const res = await pool.query('SELECT * FROM feedback_groups WHERE canonical_key = $1', [key]);
    return res.rows[0] || null;
  }

  async create(label: string, canonicalKey: string): Promise<GroupRecord> {
    const res = await pool.query(
      'INSERT INTO feedback_groups (label, canonical_key) VALUES ($1, $2) ON CONFLICT (canonical_key) DO UPDATE SET label = EXCLUDED.label RETURNING *',
      [label, canonicalKey]
    );
    return res.rows[0];
  }

  async getClusterStats() {
    const res = await pool.query(`
      SELECT g.label, COUNT(f.id) as count
      FROM feedback_groups g
      JOIN feedback f ON f.group_id = g.id
      GROUP BY g.id, g.label
      ORDER BY count DESC
    `);
    return res.rows;
  }
}
