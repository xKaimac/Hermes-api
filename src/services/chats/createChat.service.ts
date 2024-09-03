import { ChatMember } from '../../../shared/types/ChatMember';
import { ChatValues } from '../../../shared/types/ChatValues';
import pool from '../../config/db.config';
import addChatParticipants from './addChatParticipants.service';

const createChat = async (
  name: string,
  members: Array<ChatMember>
): Promise<ChatValues> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN;');

    const { rows } = await client.query(
      'INSERT INTO chats(name) VALUES($1) RETURNING *',
      [name]
    );

    const chat = rows[0];

    if (!chat) throw new Error('Failed to create chat');

    await client.query('COMMIT');
    await addChatParticipants(chat.id, members);

    const newChat = {
      id: chat.id,
      name: chat.name,
      chat_picture: chat.chat_picture,
    };

    return newChat;
  } catch (error) {
    console.error(error);
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export default createChat;
