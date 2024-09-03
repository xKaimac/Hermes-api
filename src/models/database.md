# Database Schema Documentation

## Overview

This covers the creation and structure of the following tables:

-   Users
-   Friends
-   Chats
-   Chat Participants
-   Messages

Each section includes the SQL schema, explanation of each field, and relationships between the tables.

## Database Tables

### Users Table

#### Schema Definition

```sql
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
);
```

#### Fields

-   **id**: Unique identifier for each user (Primary Key).
-   **username**: Unique username for the user.
-   **status_text**: Text status set by the user.
-   **status_type**: Status type, limited to 'offline', 'online', or 'busy'.
-   **google_id**: Unique identifier for Google authentication.
-   **discord_id**: Unique identifier for Discord authentication.
-   **github_id**: Unique identifier for GitHub authentication.
-   **first_login**: Boolean indicating if it's the user's first login (default is TRUE).
-   **created_at**: Timestamp indicating when the user was created.
-   **profile_picture**: URL to the user's profile picture.

### Friends Table

#### Schema Definition

```sql
CREATE TABLE IF NOT EXISTS friends (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  friend_id INTEGER REFERENCES users(id),
  status VARCHAR(50) CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, friend_id)
);
```

#### Fields

-   **id**: Unique identifier for each friendship (Primary Key).
-   **user_id**: User ID of the person who initiated the friendship (Foreign Key referencing `users.id`).
-   **friend_id**: User ID of the friend (Foreign Key referencing `users.id`).
-   **status**: Status of the friendship, limited to 'pending', 'accepted', or 'blocked'.
-   **created_at**: Timestamp indicating when the friendship was created.

### Chats Table

#### Schema Definition

```sql
CREATE TABLE IF NOT EXISTS chats (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  chat_picture VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Fields

-   **id**: Unique identifier for each chat (Primary Key).
-   **name**: Name of the chat.
-   **chat_picture**: The picutre used in the chat preview.
-   **created_at**: Timestamp indicating when the chat was created.

### Chat Participants Table

#### Schema Definition

```sql
CREATE TABLE IF NOT EXISTS chat_participants (
  id SERIAL PRIMARY KEY,
  chat_id INTEGER REFERENCES chats(id),
  user_id INTEGER REFERENCES users(id),
  role TEXT CHECK (role IN ('regular', 'admin')) DEFAULT 'user',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(chat_id, user_id)
);
```

#### Fields

-   **id**: Unique identifier for each chat participant (Primary Key).
-   **chat_id**: Chat ID that the user is participating in (Foreign Key referencing `chats.id`).
-   **user_id**: User ID of the participant (Foreign Key referencing `users.id`).
-   **role**: The role that the user plays in the chat (Must be `regular` or `admin`).
-   **joined_at**: Timestamp indicating when the user joined the chat.

### Messages Table

#### Schema Definition

```sql
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  chat_id INTEGER REFERENCES chats(id),
  sender_id INTEGER REFERENCES users(id),
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Fields

-   **id**: Unique identifier for each message (Primary Key).
-   **chat_id**: Chat ID that the message belongs to (Foreign Key referencing `chats.id`).
-   **sender_id**: User ID of the sender (Foreign Key referencing `users.id`).
-   **content**: Content of the message.
-   **created_at**: Timestamp indicating when the message was created.

## Relationships

-   **Users and Friends**: Each user can have multiple friends, and each friendship has a status.
-   **Chats and Chat Participants**: Each chat can have multiple participants, and each participant is linked to a chat and a user.
-   **Chats and Messages**: Each chat can have multiple messages, and each message is linked to a chat and a sender (user).

## Initialization

### Create All Tables

To create all the tables, execute the `createAllTables` function:

```typescript
import pool from "../config/db.config";

const createUsersTable = async () => {
    /* ... */
};
const createFriendsTable = async () => {
    /* ... */
};
const createChatsTable = async () => {
    /* ... */
};
const createChatParticipantsTable = async () => {
    /* ... */
};
const createMessagesTable = async () => {
    /* ... */
};

const createAllTables = () => {
    createUsersTable();
    createFriendsTable();
    createChatsTable();
    createChatParticipantsTable();
    createMessagesTable();
};

export default createAllTables;
```

### Usage

-   **Run the Initialization**:
    Call the `createAllTables` function when setting up your application to ensure all tables are created:

    ```typescript
    import createAllTables from "./path/to/this/file";

    createAllTables();
    ```
