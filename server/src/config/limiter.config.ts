import rateLimit from 'express-rate-limit';

export default rateLimit({
    windowMs: 15 * 60 * 1000, // rate limit set to 15 minutes
    max: 100, // limit rate is 100
    standardHeaders: true,
    legacyHeaders: false,
    ipv6Subnet: 56,
});
