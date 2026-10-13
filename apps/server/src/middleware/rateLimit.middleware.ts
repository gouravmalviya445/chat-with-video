import { rateLimit, ipKeyGenerator } from "express-rate-limit";

type RateLimitOptions = {
  limit: number;
  windowMs: number;
  namespace: string;
};

/** In-memory fixed-window limit keyed by authenticated user, with an IP fallback. */
function createRateLimit({ limit, windowMs, namespace }: RateLimitOptions) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    keyGenerator: (req) => req.user?.id ?? ipKeyGenerator(req.ip ?? "unknown"),
    handler: (_req, res) => {
      res.status(429).json({
        success: false,
        statusCode: 429,
        message: "Too many requests. Please try again later.",
      });
    },
    identifier: namespace,
  });
}

export const authenticatedRateLimit = createRateLimit({
  namespace: "api",
  limit: 120,
  windowMs: 60_000,
});

export const chatRateLimit = createRateLimit({
  namespace: "chat",
  limit: 10,
  windowMs: 60_000,
});

export const videoIngestionRateLimit = createRateLimit({
  namespace: "video-ingestion",
  limit: 5,
  windowMs: 60_000,
});
