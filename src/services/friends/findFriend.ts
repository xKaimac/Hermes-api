import { User } from '../../../shared/types/User';
import pool from '../../config/db.config';
import { findUserByName } from '../user/user.service';

const findFriend = async (
  user_id: number,
  friendName: string
): Promise<User | null> => {
  const client = await pool.connect();
  const friend: User = await findUserByName(friendName);

  if (!friend.id) {
    return null;
  }

  try {
    await client.query('BEGIN;');

    const { rows } = await client.query(
      'SELECT * FROM friends WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)',
      [user_id, friend.id]
    );

    await client.query('COMMIT');

    if (rows.length <= 0) {
      return null;
    }
  } catch (error) {
    await client.query('ROLLBACK');

    return null;
  } finally {
    client.release();
  }

  return friend;
};

export default findFriend;
