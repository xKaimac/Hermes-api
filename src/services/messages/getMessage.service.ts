import { Message } from '../../../shared/types/Message';
import pool from '../../config/db.config';

const getMessage = async (message_id: number, current_user_id: number): Promise<Message | null> => {
  const client = await pool.connect();
  let message: Message | null = null;
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(`
      SELECT 
        m.id,
        m.chat_id,
        m.sender_id, 
        m.content, 
        m.created_at,
        m.reply_to_id, 
        COALESCE(json_agg(ml.user_id) FILTER (WHERE ml.user_id IS NOT NULL), '[]') as liked_by,
        COUNT(ml.user_id) as likes,
        EXISTS(SELECT 1 FROM message_likes WHERE message_id = m.id AND user_id = $2) as liked_by_current_user
      FROM messages m
      LEFT JOIN message_likes ml ON m.id = ml.message_id
      WHERE m.id = $1
      GROUP BY m.id
    `, [message_id, current_user_id]);
    await client.query('COMMIT');

    if (rows.length > 0) {
      const row = rows[0];
      message = {
        id: row.id,
        chat_id: row.chat_id,
        sender_id: row.sender_id,
        content: row.content,
        likes: parseInt(row.likes),
        liked_by: row.liked_by,
        liked_by_current_user: row.liked_by_current_user,
        created_at: row.created_at,
        reply_to_id: row.reply_to_id, 
      };
    }
  } catch (error) {
    console.error('Error in getMessage:', error);
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }
  return message;
};

export default getMessage;
