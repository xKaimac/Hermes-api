import pool from '../../config/db.config';

const likeMessage = async (message_id: number, user_id: number): Promise<Boolean> => {
  const client = await pool.connect();
  let success: boolean = false;

  try {
    await client.query('BEGIN');
    await client.query(`
      INSERT INTO message_likes
      (message_id, user_id)
      VALUES ($1, $2)
      `, [message_id, user_id]);
    await client.query('COMMIT');
    
    success = true;

  } catch (error) {
    console.error(error);
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }
  return success;
};

export default likeMessage;
