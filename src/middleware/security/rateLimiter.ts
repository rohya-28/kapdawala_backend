import rateLimit from "express-rate-limit";

//  Global rate limiter 
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  message: {
    success: false,
    message: "Too many requests, please slow down 🧊",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login limiter
export const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 5, 
  message: {
    success: false,
    message: "Too many login attempts. Try again later ⏳",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
