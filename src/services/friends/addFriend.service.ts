import pool from '../../config/db.config';
import handleFriendRequest from './handleFriendRequest.service';

const getFriendId = async (friendName: string): Promise<number | undefined> => {
  const client = await pool.connect();
  let friend_id: number | undefined;

  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'SELECT id FROM users WHERE UPPER(username) = $1',
      [friendName.toUpperCase()]
    );

    if (rows.length > 0) {
      friend_id = rows[0].id;
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }

  return friend_id;
};

const getRequestStatus = async (
  user_id: number,
  friend_id: number
): Promise<string | undefined> => {
  const client = await pool.connect();
  const accepted = 'accepted';
  let status: string | undefined;

  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'SELECT status FROM friends WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)',
      [user_id, friend_id]
    );

    if (rows.length > 0) {
      status = rows[0].status;
      if (status === 'pending') {
        await handleFriendRequest(accepted, user_id, friend_id);
        status = accepted;
      }
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }

  return status;
};

const sendFriendRequest = async (
  user_id: number,
  friendName: string
): Promise<{ success: boolean; friend_id: number }> => {
  const client = await pool.connect();
  const friend_id: number | undefined = await getFriendId(friendName);
  const success: { success: boolean; friend_id: number } = {
    success: false,
    friend_id: 0,
  };
  let status: string | undefined;

  if (!friend_id) {
    return success;
  }

  status = await getRequestStatus(user_id, friend_id);

  if (!status) {
    status = 'pending';
  } else if (status === 'accepted') {
    success.success = true;

    return success;
  }

  try {
    await client.query('BEGIN;');
    await client.query(
      'INSERT INTO friends (user_id, friend_id, status) VALUES ($1, $2, $3)',
      [user_id, friend_id, status]
    );
    await client.query('COMMIT');
    success.success = true;
  } catch (error) {
    await client.query('ROLLBACK');
    success.success = false;
  } finally {
    client.release();
  }

  return success;
};

export default sendFriendRequest;
