import { User } from '../../../shared/types/User';
import pool from '../../config/db.config';

const getProfilePicture = (profile: any) => {
  if (profile.photos && profile.photos.length > 0) {
    return profile.photos[0].value;
  }
  if (profile.id && profile.avatar) {
    return `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`;
  }

  return null;
};

const findOrCreateUser = async (provider: string, profile: any) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const providerId = `${provider}_id`;
    const { rows } = await client.query(
      `SELECT * FROM users WHERE ${providerId} = $1`,
      [profile.id]
    );
    let user;
    let isFirstLogin = false;
    const statusType = 'online';

    if (rows.length > 0) {
      // User exists, update the provider ID if it's not set
      user = rows[0];
      if (!user[providerId]) {
        await client.query(
          `UPDATE users SET ${providerId} = $1, first_login = $2, status_type = $3 WHERE id = $4`,
          [profile.id, isFirstLogin, statusType, user.id]
        );
      } else {
        // User exists and provider ID is set, just update first_login
        await client.query(
          `UPDATE users SET first_login = false WHERE id = $1`,
          [user.id]
        );
      }
    } else {
      isFirstLogin = true;
      // No user found, create a new one
      const newUser = {
        username: profile.displayName || profile.username,
        [providerId]: profile.id,
        status_type: statusType,
        first_login: isFirstLogin,
        profile_picture: getProfilePicture(profile),
      };
      const { rows: newRows } = await client.query(
        `INSERT INTO users (username, ${providerId}, status_type, first_login, profile_picture) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [
          newUser.username,
          newUser[providerId],
          newUser.status_type,
          newUser.first_login,
          newUser.profile_picture,
        ]
      );

      user = newRows[0];
    }
    await client.query('COMMIT');

    return { user, isFirstLogin };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

export const findUserById = async (id: string) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

  return rows[0];
};

export const findUserByName = async (name: string): Promise<User> => {
  const { rows } = await pool.query(
    'SELECT id, profile_picture FROM users WHERE username = $1',
    [name]
  );

  const friendData: User = {
    id: rows[0].id,
    username: name,
    profile_picture: rows[0].profile_picture,
  };

  return friendData;
};

export default findOrCreateUser;
