import pool from '../../config/db.config';
import findFriend from '../friends/findFriend';

const addChatMember = async (
  chat_id: number,
  friendName: string,
  user_id: number
): Promise<boolean> => {
  const client = await pool.connect();
  let result = false;
  const role = 'regular';

  const friend = await findFriend(user_id, friendName);
  const friend_id: number | undefined = friend?.id;

  if (!friend_id) {
    return result;
  }

  try {
    await client.query('BEGIN;');
    await client.query(
      'INSERT INTO chat_participants (user_id, chat_id, role) VALUES ($1, $2, $3)',
      [friend_id, chat_id, role]
    );
    await client.query('COMMIT');
    result = true;
  } catch (error) {
    console.error(error);
    await client.query('ROLLBACK');
    result = false;
  } finally {
    client.release();
  }

  return result;
};

export default addChatMember;
