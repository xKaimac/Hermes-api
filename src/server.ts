import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import http from 'http';
import passport from 'passport';
import path from 'path';
import { Server } from 'socket.io';
import RedisStore, { connectRedis } from 'connect-redis';

import { configurePassport } from './config/passport.config';
import { isAuthenticated } from './middleware/auth.middleware';
import createAllTables from './models/user.model';
import routes from './routes/index';
import publicRoutes from './routes/public.routes';
import { initializeSocket } from './services/socket/socket.service';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  password: process.env.REDIS_PASSWORD,
});
redisClient.connect().catch(console.error);
const io = new Server(server, {
  cors: {
    origin: process.env.HERMES_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

initializeSocket(io);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.HERMES_URL,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.set('trust proxy', 1);
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || '',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: 'none',
      domain: '.herokuapp.com',
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

configurePassport({
  google: {
    clientID: process.env.AUTH_GOOGLE_CLIENT!,
    clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    callbackURL: `${process.env.HERMES_API}/auth/google/callback`,
    scope: ['profile'],
  },
  discord: {
    clientID: process.env.AUTH_DISCORD_CLIENT!,
    clientSecret: process.env.AUTH_DISCORD_SECRET!,
    callbackURL: `${process.env.HERMES_API}/auth/discord/callback`,
    scope: ['identify'],
  },
  github: {
    clientID: process.env.AUTH_GITHUB_CLIENT!,
    clientSecret: process.env.AUTH_GITHUB_SECRET!,
    callbackURL: `${process.env.HERMES_API}/auth/github/callback`,
    scope: ['read:user'],
  },
});

app.use((req, res, next) => {
  if (publicRoutes.includes(req.path)) {
    return next();
  }
  isAuthenticated(req, res, next);
});

createAllTables();

app.use(routes);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
