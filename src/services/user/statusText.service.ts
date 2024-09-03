import pool from '../../config/db.config';

const updateStatusText = async (
  user_id: number,
  status_text: string
): Promise<boolean> => {
  const client = await pool.connect();
  let success = false;

  try {
    await client.query('BEGIN;');
    await client.query('UPDATE users SET status_text = $1 WHERE id = $2', [
      status_text,
      user_id,
    ]);
    await client.query('COMMIT');
    success = true;
  } catch (e) {
    await client.query('ROLLBACK');
    success = false;
  } finally {
    client.release();
  }

  return success;
};

export default updateStatusText;
