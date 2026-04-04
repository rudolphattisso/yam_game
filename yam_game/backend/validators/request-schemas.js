const { z } = require('zod');

const trimmedString = z.string().trim();

const registerSchema = z.object({
  username: trimmedString.min(3).max(50),
  email: trimmedString.email(),
  password: z.string().min(6).max(200),
});

const loginSchema = z.object({
  identifier: trimmedString.min(1).max(120),
  password: z.string().min(1).max(200),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(10).max(4096),
});

const logoutSchema = z.object({
  refreshToken: z.string().min(10).max(4096),
});

const recentGamesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  recentGamesQuerySchema,
};