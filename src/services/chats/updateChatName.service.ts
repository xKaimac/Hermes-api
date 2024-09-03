import pool from '../../config/db.config';

const updateChatName = async (
  chat_name: number,
  chat_id: number
): Promise<boolean> => {
  const client = await pool.connect();

  let success = false;

  try {
    await client.query('BEGIN;');
    await client.query('UPDATE chats SET name = $1 WHERE id = $2', [
      chat_name,
      chat_id,
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

export default updateChatName;
