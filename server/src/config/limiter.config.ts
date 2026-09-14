import rateLimit from 'express-rate-limit';

/**
 * Global rate limiter — applied to all routes.
 * Generous enough to handle a live class with many participants
 * making frequent API calls (auth checks, data fetches, etc.).
 */
export default rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 req / 15 min per IP
    standardHeaders: true,
    legacyHeaders: false,
    ipv6Subnet: 56,
    message: { error: 'Too many requests, please try again later.' },
});

/**
 * Strict limiter for auth endpoints (/auth/oauth, /auth/callback).
 * Protects against brute-force and OAuth abuse without impacting
 * normal classroom traffic.
 */
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 auth attempts / 15 min per IP
    standardHeaders: true,
    legacyHeaders: false,
    ipv6Subnet: 56,
    message: {
        error: 'Too many authentication attempts, please try again later.',
    },
});

/**
 * Generous limiter for live-class endpoints.
 * During an active class, participants frequently hit these routes
 * for tokens, session state, and events — so the limit is high.
 */
export const liveClassRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 120, // 120 req / min per IP (2 req/sec headroom)
    standardHeaders: true,
    legacyHeaders: false,
    ipv6Subnet: 56,
    message: {
        error: 'Too many live class requests, please try again shortly.',
    },
});
