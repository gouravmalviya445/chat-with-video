import type { Request, Response, NextFunction } from "express";

import { fromNodeHeaders } from "better-auth/node";
import createHttpError from "http-errors";
import { auth } from "@/lib/auth";

declare global {
  namespace Express {
    interface Request {
      user: typeof auth.$Infer.Session.user;
      session: typeof auth.$Infer.Session.session;
    }
  }
}

/**
 * Authentication middleware to check if the user is authenticated
 * And attach session and user to the request
 */
export async function requireAuth(
  req: Request,
  _: Response,
  next: NextFunction
) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    });

    if (!session) {
      next(createHttpError(401, "Authentication Required"));
      return;
    }

    // attach session and user to request
    req.user = session.user;
    req.session = session.session;

    // pass the req to next middleware/controller
    next();

  } catch (err) {
    console.error("Authentication error:", err);
    next(createHttpError(500, "Invalid or expired session"));
  }
}