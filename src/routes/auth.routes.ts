import dotenv from 'dotenv';
import express from 'express';
import passport from 'passport';

import path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const router = express.Router();
const HERMES_URL = process.env.HERMES_URL || '';
const FAILURE = `${HERMES_URL}/login`;

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: FAILURE }),
  (req, res) => {
    const user = req.user as any;

    if (user.isFirstLogin) {
      res.redirect(`${HERMES_URL}/Username`);
    } else {
      res.redirect(HERMES_URL);
    }
  }
);

router.get(
  '/discord',
  passport.authenticate('discord', { scope: ['identify', 'email'] })
);

router.get(
  '/discord/callback',
  passport.authenticate('discord', { failureRedirect: FAILURE }),
  (req, res) => {
    const user = req.user as any;

    if (user.isFirstLogin) {
      res.redirect(`${HERMES_URL}/Username`);
    } else {
      res.redirect(HERMES_URL);
    }
  }
);

router.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: FAILURE }),
  (req, res) => {
    const user = req.user as any;

    if (user.isFirstLogin) {
      res.redirect(`${HERMES_URL}/Username`);
    } else {
      res.redirect(HERMES_URL);
    }
  }
);

router.get('/status', (req, res) => {
  console.log('Session:', req.session);
  console.log('User:', req.user);
  console.log('Is Authenticated:', req.isAuthenticated());
  
  if (req.isAuthenticated()) {
    res.json({ isAuthenticated: true, user: req.user });
  } else {
    res.json({ isAuthenticated: false });
  }
});

export default router;
