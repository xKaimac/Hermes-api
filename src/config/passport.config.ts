import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import findOrCreateUser, { findUserById } from '../services/user/user.service';

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
export const configurePassport = (config: PassportConfig) => {
  // Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.clientID,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackURL,
        scope: config.google.scope || ['profile'],
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: any
      ) => {
        try {
          const { user, isFirstLogin } = await findOrCreateUser(
            'google',
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
        scope: config.discord.scope || ['identify'],
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: any
      ) => {
        try {
          const { user, isFirstLogin } = await findOrCreateUser(
            'discord',
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
        scope: config.github.scope || ['read:user'],
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: any
      ) => {
        try {
          const { user, isFirstLogin } = await findOrCreateUser(
            'github',
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
