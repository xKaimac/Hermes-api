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

const getChats = async (user_id: number): Promise<Array<ChatValues>> => {
  const client = await pool.connect();
  const chats = new Array<ChatValues>();

  try {
    await client.query('BEGIN;');
    const { rows } = await client.query(
      'SELECT chats.id, chats.name, chats.chat_picture FROM chats JOIN (SELECT chat_participants.chat_id, chat_participants.user_id FROM chat_participants WHERE chat_participants.user_id = $1) AS user_chats ON chats.id = user_chats.chat_id',
      [user_id]
    );

    await client.query('COMMIT');

    for (const row of rows) {
      const mostRecentMessage = await getMostRecentMessage(row.id);
      const chat: ChatValues = {
        id: row.id,
        name: row.name,
        chat_picture: row.chat_picture,
        mostRecentMessage: mostRecentMessage,
      };

      chats.push(chat);
    }
  } catch (error) {
    console.log(error);
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }

  return chats;
};

export default getChats;
