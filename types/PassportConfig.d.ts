interface StrategyConfig {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
  scope?: string[];
}

export interface PassportConfig {
  google: StrategyConfig;
  discord: StrategyConfig;
  github: StrategyConfig;
}
