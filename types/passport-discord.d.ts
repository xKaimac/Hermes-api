declare module "passport-discord" {
  import { Strategy as PassportStrategy } from "passport-strategy";

  export interface Profile {
    id: string;
    username: string;
    displayName: string;
    email?: string;
    avatar?: string;
  }

  export interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string[];
  }

  export class Strategy extends PassportStrategy {
    constructor(
      options: StrategyOptions,
      verify: (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: (error: any, user?: any) => void
      ) => void
    );
  }
}
