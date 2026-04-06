import rateLimit from "express-rate-limit";

export const leadSubmissionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per window
    message: {
        status: 429,
        message: "Too many lead submissions, please try again after 15 minutes."
    },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});