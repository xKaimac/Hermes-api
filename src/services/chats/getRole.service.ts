import pool from '../../config/db.config';

const getRole = async (user_id: number, chat_id: number): Promise<string> => {
  const client = await pool.connect();
  let role = 'regular';

  try {
    await client.query('BEGIN;');
    const { rows } = await client.query(
      'SELECT role FROM chat_participants WHERE (user_id = $1 AND chat_id = $2)',
      [user_id, chat_id]
    );

    await client.query('COMMIT');

    role = rows[0].role;
  } catch (error) {
    console.log(error);
    await client.query('ROLLBACK');
  } finally {
    client.release();
  }

  return role;
};

export default getRole;
