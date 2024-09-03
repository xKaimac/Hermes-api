# Backend Configuration

## Overview

This documentation covers the implementation and usage of the configuration files for the backend. The following configurations are included:

-   Cloudinary configuration (`cloudinary.config.ts`)
-   Database configuration (`db.config.ts`)
-   Passport (authentication) configuration (`passport.config.ts`)

Each section will provide an explanation of the purpose of the configuration, how it is implemented, and instructions for further additions or maintenance.

## Cloudinary Configuration

### File: `cloudinary.config.ts`

This file sets up the Cloudinary service for image uploads, specifically for profile pictures.

### Implementation

1. **Import Dependencies:**

    ```typescript
    import { v2 as cloudinary } from "cloudinary";
    import dotenv from "dotenv";
    import path from "path";
    ```

2. **Load Environment Variables:**

    ```typescript
    dotenv.config({ path: path.resolve(__dirname, "../../.env") });
    ```

3. **Configure Cloudinary:**

    ```typescript
    cloudinary.config();
    ```

4. **Upload Profile Picture Function:**

    ```typescript
    const uploadProfilePicture = async (file: Express.Multer.File) => {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: "image" },
                (error, result) => {
                    if (error) reject(error);
                    else {
                        resolve(result);
                    }
                }
            );
            uploadStream.end(file.buffer);
        });
    };

    export default uploadProfilePicture;
    ```

### Usage

-   **Uploading Profile Pictures:**
    Call `uploadProfilePicture` with the file buffer to upload a profile picture to Cloudinary.

-   **Environment Variables:**
    Ensure the `.env` file is correctly set up with the relevant Cloudinary configuration.

-   **Additional Configurations:**
    Modify the `cloudinary.config()` method to include additional Cloudinary settings if needed.

## Database Configuration

### File: `db.config.ts`

This file sets up the PostgreSQL database connection using the `pg` library.

### Implementation

1. **Import Dependencies:**

    ```typescript
    import { Pool } from "pg";
    import dotenv from "dotenv";
    ```

2. **Load Environment Variables:**

    ```typescript
    dotenv.config();
    ```

3. **Configure PostgreSQL Pool:**

    ```typescript
    const pool = new Pool({
        user: process.env.DATABASE_USER_NAME,
        host: process.env.DATABASE_HOST,
        database: process.env.DATABASE_NAME,
        password: process.env.DATABASE_PASSWORD,
        port: parseInt(process.env.DATABASE_PORT || "5432"),
    });

    export default pool;
    ```

### Usage

-   **Database Queries:**
    Use the `pool` object to execute SQL queries against the PostgreSQL database.

-   **Environment Variables:**
    Ensure the `.env` file includes the necessary database connection details:

    ```env
    DATABASE_USER_NAME=your_db_username
    DATABASE_HOST=your_db_host
    DATABASE_NAME=your_db_name
    DATABASE_PASSWORD=your_db_password
    DATABASE_PORT=your_db_port
    ```

-   **Pooling Options:**
    Adjust the `Pool` configuration to include additional options like `max`, `idleTimeoutMillis`, etc. if required.

## Passport Configuration

### File: `passport.config.ts`

This file configures authentication strategies using Passport.js for Google, Discord, and GitHub.

### Implementation

1. **Import Dependencies:**

    ```typescript
    import passport from "passport";
    import { Strategy as GoogleStrategy } from "passport-google-oauth20";
    import { Strategy as DiscordStrategy } from "passport-discord";
    import { Strategy as GitHubStrategy } from "passport-github2";
    import { findUserById } from "../services/user.service";
    import findOrCreateUser from "../services/user.service";
    ```

2. **Define StrategyConfig and PassportConfig Interfaces:**

    ```typescript
    interface StrategyConfig {
        clientID: string;
        clientSecret: string;
        callbackURL: string;
        scope?: string[];
    }

    interface PassportConfig {
        google: StrategyConfig;
        discord: StrategyConfig;
        github: StrategyConfig;
    }
    ```

3. **Configure Passport:**

    ```typescript
    export const configurePassport = (config: PassportConfig) => {
        // Google Strategy
        passport.use(
            new GoogleStrategy(
                {
                    clientID: config.google.clientID,
                    clientSecret: config.google.clientSecret,
                    callbackURL: config.google.callbackURL,
                    scope: config.google.scope || ["profile"],
                },
                async (
                    accessToken: string,
                    refreshToken: string,
                    profile: any,
                    done: any
                ) => {
                    try {
                        const { user, isFirstLogin } = await findOrCreateUser(
                            "google",
                            profile
                        );
                        done(null, { ...user, isFirstLogin });
                    } catch (error) {
                        done(error as Error);
                    }
                }
            )
        );

        // Discord Strategy
        passport.use(
            new DiscordStrategy(
                {
                    clientID: config.discord.clientID,
                    clientSecret: config.discord.clientSecret,
                    callbackURL: config.discord.callbackURL,
                    scope: config.discord.scope || ["identify"],
                },
                async (
                    accessToken: string,
                    refreshToken: string,
                    profile: any,
                    done: any
                ) => {
                    try {
                        const { user, isFirstLogin } = await findOrCreateUser(
                            "discord",
                            profile
                        );
                        done(null, { ...user, isFirstLogin });
                    } catch (error) {
                        done(error as Error);
                    }
                }
            )
        );

        // GitHub Strategy
        passport.use(
            new GitHubStrategy(
                {
                    clientID: config.github.clientID,
                    clientSecret: config.github.clientSecret,
                    callbackURL: config.github.callbackURL,
                    scope: config.github.scope || ["read:user"],
                },
                async (
                    accessToken: string,
                    refreshToken: string,
                    profile: any,
                    done: any
                ) => {
                    try {
                        const { user, isFirstLogin } = await findOrCreateUser(
                            "github",
                            profile
                        );
                        done(null, { ...user, isFirstLogin });
                    } catch (error) {
                        done(error as Error);
                    }
                }
            )
        );

        passport.serializeUser((user: any, done) => {
            done(null, user.id);
        });

        passport.deserializeUser(async (id: string, done) => {
            try {
                const user = await findUserById(id);
                done(null, user);
            } catch (error) {
                done(error as Error);
            }
        });
    };
    ```

### Usage

-   **Initialization:**
    Call `configurePassport` with the configuration object containing the client ID, client secret, and callback URL for each authentication strategy.

-   **Environment Variables:**
    Ensure the `.env` file includes the necessary credentials for each OAuth provider.

-   **Adding Providers:**
    Add more Passport strategies (e.g., Facebook, Twitter) by importing and configuring them similarly.
