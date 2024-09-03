import { FriendsListData } from '../../../shared/types/FriendsListData';
import { User } from '../../../shared/types/User';
import pool from '../../config/db.config';

const getFriends = async (user_id: number): Promise<FriendsListData> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN;');

    const { rows: friendships } = await client.query(
      `SELECT f.user_id, f.friend_id, f.status, 
              u1.username as user_username, u1.status_type as user_status_type, u1.status_text as user_status_text, u1.profile_picture as user_profile_picture,
              u2.username as friend_username, u2.status_type as friend_status_type, u2.status_text as friend_status_text, u2.profile_picture as friend_profile_picture
       FROM friends f
       JOIN users u1 ON f.user_id = u1.id
       JOIN users u2 ON f.friend_id = u2.id
       WHERE f.user_id = $1 OR f.friend_id = $1`,
      [user_id]
    );

    const confirmedFriends: User[] = [];
    const outgoingRequests: User[] = [];
    const incomingRequests: User[] = [];

    friendships.forEach((friendship) => {
      const isInitiator = friendship.user_id === user_id;
      const friendData: User = {
        id: isInitiator ? friendship.friend_id : friendship.user_id,
        username: isInitiator
          ? friendship.friend_username
          : friendship.user_username,
        status: isInitiator
          ? friendship.friend_status_type
          : friendship.user_status_type,
        status_text: isInitiator
          ? friendship.friend_status_text
          : friendship.user_status_text,
        profile_picture: isInitiator
          ? friendship.friend_profile_picture
          : friendship.user_profile_picture,
      };

      if (friendship.status === 'accepted') {
        confirmedFriends.push(friendData);
      } else if (friendship.status === 'pending') {
        if (isInitiator) {
          outgoingRequests.push(friendData);
        } else {
          incomingRequests.push(friendData);
        }
      }
    });

    await client.query('COMMIT');

    return { confirmedFriends, outgoingRequests, incomingRequests };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export default getFriends;
