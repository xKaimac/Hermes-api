import pool from '../../config/db.config';

const unlikeMessage = async (message_id: number, user_id: number): Promise<Boolean> => {
  const client = await pool.connect();
  let success: boolean = false;

  try {
    await client.query('BEGIN');
    await client.query(`
      DELETE FROM message_likes
      *
      WHERE message_id = $1 AND user_id = $2
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

export default unlikeMessage;
