import { ChatMember } from '../../../shared/types/ChatMember';
import pool from '../../config/db.config';

const addChatParticipants = async (
  chat_id: number,
  members: Array<ChatMember>
): Promise<boolean> => {
  const client = await pool.connect();
  let success = false;

  for (const member of members) {
    try {
      const { id, role } = member;

      await client.query('BEGIN');
      await client.query(
        'INSERT INTO chat_participants(chat_id, user_id, role) VALUES($1, $2, $3)',
        [chat_id, id, role]
      );
      await client.query('COMMIT');
    } catch (error) {
      console.log(error);
      success = false;
    }
  }
  client.release();

  return success;
};

export default addChatParticipants;
