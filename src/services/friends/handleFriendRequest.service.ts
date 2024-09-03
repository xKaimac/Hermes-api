import pool from '../../config/db.config';

const handleFriendRequest = async (
  action: string,
  user_id: number,
  friend_id: number
): Promise<boolean> => {
  const client = await pool.connect();
  let success = false;

  try {
    await client.query('BEGIN;');
    await client.query(
      'UPDATE friends SET status = $1 WHERE (user_id = $2 AND friend_id = $3) OR (user_id = $3 AND friend_id = $2)',
      [action, user_id, friend_id]
    );
    await client.query('COMMIT');
    success = true;
  } catch (error) {
    console.error(error);
    await client.query('ROLLBACK');
    success = false;
  } finally {
    client.release();
  }

  return success;
};

export default handleFriendRequest;
