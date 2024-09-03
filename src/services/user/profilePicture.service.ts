import pool from '../../config/db.config';

const updateProfilePicture = async (
  user_id: number,
  profile_picture: string
): Promise<boolean> => {
  const client = await pool.connect();

  let success = false;

  try {
    await client.query('BEGIN;');
    await client.query('UPDATE users SET profile_picture = $1 WHERE id = $2', [
      profile_picture,
      user_id,
    ]);
    await client.query('COMMIT');
    success = true;
  } catch (e) {
    await client.query('ROLLBACK');
    success = false;
  } finally {
    client.release();
  }

  return success;
};

export default updateProfilePicture;
