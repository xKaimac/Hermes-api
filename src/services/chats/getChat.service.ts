import { ChatValues } from '../../../shared/types/ChatValues';
import pool from '../../config/db.config';

const getMostRecentMessage = async (chat_id: string): Promise<string> => {
  const client = await pool.connect();
  let result = '';

  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'SELECT content FROM messages WHERE chat_id = $1 ORDER BY created_at DESC LIMIT 1',
      [chat_id]
    );

    await client.query('COMMIT');

    if (rows.length > 0) {
      result = rows[0].content;
    }
  } catch (error) {
    console.error(error);
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }

  return result;
};

const getChat = async (chat_id: number): Promise<ChatValues | null> => {
  const client = await pool.connect();
  let chat: ChatValues;

  try {
    await client.query('BEGIN;');
    console.log("chat id "+ chat_id)
    const { rows } = await client.query(
      'SELECT * FROM chats WHERE id = $1',
      [chat_id]
    );

    await client.query('COMMIT');
    const result = rows[0];

      const mostRecentMessage = await getMostRecentMessage(result.id);
      chat = {
        id: result.id,
        name: result.name,
        chat_picture: result.chat_picture,
        mostRecentMessage: mostRecentMessage,
      }
  } catch (error) {
    console.log(error);
    await client.query('ROLLBACK');
    return null;
  } finally {
    client.release();
  }

  return chat;
};

export default getChat;
