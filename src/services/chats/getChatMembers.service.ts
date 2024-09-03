import { ChatMember } from '../../../shared/types/ChatMember';
import pool from '../../config/db.config';

const getChatMembers = async (chat_id: number): Promise<Array<ChatMember>> => {
  const client = await pool.connect();
  const members = new Array<ChatMember>();

  try {
    await client.query('BEGIN;');
    const { rows } = await client.query(
      'SELECT users.id, users.username, users.profile_picture, chat_participants.role, chat_participants.joined_at FROM chat_participants LEFT JOIN users ON users.id = chat_participants.user_id WHERE chat_participants.chat_id = $1',
      [chat_id]
    );

    await client.query('COMMIT');
    for (const row of rows) {
      const member: ChatMember = {
        id: row.id,
        username: row.username,
        profile_picture: row.profile_picture,
        role: row.role,
        joined_at: row.joined_at,
      };

      members.push(member);
    }
  } catch (error) {
    console.log(error);
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }

  return members;
};

export default getChatMembers;
