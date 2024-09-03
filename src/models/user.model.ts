import pool from '../config/db.config';

const createUsersTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE,
      status_text TEXT,
      status_type VARCHAR(50) CHECK (status_type IN ('offline', 'online', 'busy')),
      google_id VARCHAR(255) UNIQUE,
      discord_id VARCHAR(255) UNIQUE,
      github_id VARCHAR(255) UNIQUE,
      first_login BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      profile_picture VARCHAR(255)
    )
  `;

  try {
    await pool.query(createTableQuery);
  } catch (error) {
    console.error('Error creating users table', error);
  }
};

const createFriendsTable = async () => {
  const createTableQuery = `
  CREATE TABLE IF NOT EXISTS friends (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    friend_id INTEGER REFERENCES users(id),
    status VARCHAR(50) CHECK (status IN ('pending', 'accepted', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, friend_id)
  );
  `;

  try {
    await pool.query(createTableQuery);
  } catch (error) {
    console.error('Error creating friends table', error);
  }
};

const createChatsTable = async () => {
  const createTableQuery = `
  CREATE TABLE IF NOT EXISTS chats (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    chat_picture VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  `;

  try {
    await pool.query(createTableQuery);
  } catch (error) {
    console.error('Error creating chats table', error);
  }
};

const createChatParticipantsTable = async () => {
  const createTableQuery = `
  CREATE TABLE IF NOT EXISTS chat_participants (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES chats(id),
    user_id INTEGER REFERENCES users(id),
    role TEXT CHECK (role IN ('regular', 'admin')) DEFAULT 'regular',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(chat_id, user_id)
  );
  `;

  try {
    await pool.query(createTableQuery);
  } catch (error) {
    console.error('Error creating chat participants table', error);
  }
};

const createMessagesTable = async () => {
  const createTableQuery = `
  CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER REFERENCES chats(id),
    sender_id INTEGER REFERENCES users(id),
    content TEXT,
    reply_to_id INTEGER REFERENCES messages(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  `;

  try {
    await pool.query(createTableQuery);
  } catch (error) {
    console.error('Error creating messages table', error);
  }
};

const createMessageLikesTable = async () => {
  const createTableQuery = `
  CREATE TABLE IF NOT EXISTS message_likes (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES messages(id),
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, user_id)
  );  `;

  try {
    await pool.query(createTableQuery);
  } catch (error) {
    console.error('Error creating message likes table', error);
  }
};

const createAllTables = () => {
  createUsersTable();
  createFriendsTable();
  createChatsTable();
  createChatParticipantsTable();
  createMessagesTable();
  createMessageLikesTable();
};

export default createAllTables;
