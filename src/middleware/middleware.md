# Authentication Middleware Documentation

## Overview

This documentation covers the implementation and usage of the authentication middleware (`auth.middleware.ts`) for the Hermes backend. This middleware is designed to protect routes by ensuring that only authenticated users can access them.

## Authentication Middleware

### File: `auth.middleware.ts`

This file contains middleware that checks if a user is authenticated before allowing access to certain routes.

### Implementation

1. **Import Dependencies:**
   ```typescript
   import { Request, Response, NextFunction } from "express";
   ```

2. **Authentication Check Middleware:**
   ```typescript
   export const isAuthenticated = (
     req: Request,
     res: Response,
     next: NextFunction
   ) => {
     if (req.isAuthenticated()) {
       return next();
     }
     res.status(401).json({ message: "Unauthorized: Please log in" });
   };
   ```

### Explanation

- **Function Definition:**
  The `isAuthenticated` function is defined with three parameters:
  - `req`: The request object from the client.
  - `res`: The response object to send the response back to the client.
  - `next`: The next middleware function in the Express.js request-response cycle.

- **Authentication Check:**
  The middleware checks if the request is authenticated using `req.isAuthenticated()`, a method provided by Passport.js to check if the user is logged in.

- **Authorization Handling:**
  - If the user is authenticated, the `next` middleware function is called, allowing the request to proceed.
  - If the user is not authenticated, a 401 Unauthorized status code is returned along with a JSON response indicating that the user needs to log in.

### Usage

- **Protecting Routes:**
  To use this middleware, apply it to routes that require authentication. For example:
  ```typescript
  import express from "express";
  import { isAuthenticated } from "./path/to/auth.middleware";

  const router = express.Router();

  router.get("/protected-route", isAuthenticated, (req, res) => {
    res.json({ message: "This is a protected route" });
  });

  export default router;
  ```

- **Integration with Passport.js:**
  Ensure that Passport.js is properly configured and initialized in your Express application to use `req.isAuthenticated()` effectively.
