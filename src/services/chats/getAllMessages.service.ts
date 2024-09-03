import { Message } from '../../../shared/types/Message';
import pool from '../../config/db.config';

const getAllMessages = async (chat_id: number, current_user_id: number): Promise<Array<Message>> => {
  const client = await pool.connect();
  const messages = new Array<Message>();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(`
      SELECT 
        m.id,
        m.sender_id, 
        m.content, 
        m.created_at,
        m.reply_to_id,
        COALESCE(json_agg(ml.user_id) FILTER (WHERE ml.user_id IS NOT NULL), '[]') as liked_by,
        COUNT(ml.user_id) as likes,
        EXISTS(SELECT 1 FROM message_likes WHERE message_id = m.id AND user_id = $2) as liked_by_current_user
      FROM messages m
      LEFT JOIN message_likes ml ON m.id = ml.message_id
      WHERE m.chat_id = $1
      GROUP BY m.id
      ORDER BY m.created_at ASC
    `, [chat_id, current_user_id]);
    await client.query('COMMIT');

    for (const row of rows) {
      const message: Message = {
        id: row.id,
        chat_id: chat_id,
        sender_id: row.sender_id,
        content: row.content,
        likes: parseInt(row.likes),
        liked_by: row.liked_by,
        liked_by_current_user: row.liked_by_current_user,
        created_at: row.created_at,
        reply_to_id: row.reply_to_id
      };
      messages.push(message);
    }
  } catch (error) {
    console.error(error);
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }
  return messages;
};

export default getAllMessages;
