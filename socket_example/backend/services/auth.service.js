const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../db/postgres');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_only_change_me';
const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || '15m';
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL || '7d';

const isEmail = (value) => value.includes('@');
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

const signAccessToken = (user) => jwt.sign(
  {
    type: 'access',
    sub: user.id,
    username: user.username,
    email: user.email,
  },
  JWT_SECRET,
  { expiresIn: ACCESS_TOKEN_TTL },
);

const signRefreshToken = (user) => jwt.sign(
  {
    type: 'refresh',
    sub: user.id,
  },
  JWT_SECRET,
  {
    expiresIn: REFRESH_TOKEN_TTL,
    jwtid: crypto.randomUUID(),
  },
);

const mapUserPayload = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
});

const issueSessionTokens = async (user, metadata = {}) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  const refreshTokenHash = sha256(refreshToken);

  await query(
    `
    INSERT INTO auth_sessions (user_id, refresh_token_hash, user_agent, ip_address, expires_at)
    VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')
    `,
    [user.id, refreshTokenHash, metadata.userAgent || null, metadata.ipAddress || null],
  );

  return {
    accessToken,
    refreshToken,
    user: mapUserPayload(user),
  };
};

const register = async ({ username, email, password }, metadata = {}) => {
  if (!username || !email || !password) {
    return { status: 400, body: { message: 'username, email et password sont requis' } };
  }

  if (password.length < 6) {
    return { status: 400, body: { message: 'Le mot de passe doit contenir au moins 6 caracteres' } };
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const insertUserResult = await query(
      `
      INSERT INTO users (email, username, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, username, email
      `,
      [email.trim().toLowerCase(), username.trim(), passwordHash],
    );

    const user = insertUserResult.rows[0];

    await query(
      `
      INSERT INTO user_identities (user_id, provider, provider_user_id, email_verified)
      VALUES ($1, 'local', $2, false)
      `,
      [user.id, user.email],
    );

    const session = await issueSessionTokens(user, metadata);

    return {
      status: 201,
      body: {
        message: 'Compte cree avec succes',
        ...session,
      },
    };
  } catch (error) {
    if (error.code === '23505') {
      return { status: 409, body: { message: 'Email ou pseudo deja utilise' } };
    }

    return { status: 500, body: { message: 'Erreur serveur pendant l inscription' } };
  }
};

const login = async ({ identifier, password }, metadata = {}) => {
  if (!identifier || !password) {
    return { status: 400, body: { message: 'identifier et password sont requis' } };
  }

  const normalizedIdentifier = identifier.trim();

  const result = await query(
    `
    SELECT id, username, email, password_hash, status
    FROM users
    WHERE email = $1 OR username = $2
    LIMIT 1
    `,
    [isEmail(normalizedIdentifier) ? normalizedIdentifier.toLowerCase() : normalizedIdentifier, normalizedIdentifier],
  );

  const user = result.rows[0];

  if (!user || !user.password_hash) {
    return { status: 401, body: { message: 'Identifiants invalides' } };
  }

  if (user.status !== 'active') {
    return { status: 403, body: { message: 'Compte inactif' } };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    return { status: 401, body: { message: 'Identifiants invalides' } };
  }

  await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

  const session = await issueSessionTokens(user, metadata);

  return {
    status: 200,
    body: {
      message: 'Connexion reussie',
      ...session,
    },
  };
};

const refresh = async ({ refreshToken }, metadata = {}) => {
  if (!refreshToken) {
    return { status: 400, body: { message: 'refreshToken requis' } };
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, JWT_SECRET);
  } catch (_error) {
    return { status: 401, body: { message: 'Refresh token invalide ou expire' } };
  }

  if (decoded.type !== 'refresh') {
    return { status: 401, body: { message: 'Token invalide' } };
  }

  const refreshTokenHash = sha256(refreshToken);

  const sessionResult = await query(
    `
    SELECT id, user_id
    FROM auth_sessions
    WHERE refresh_token_hash = $1
      AND revoked_at IS NULL
      AND expires_at > NOW()
    LIMIT 1
    `,
    [refreshTokenHash],
  );

  const activeSession = sessionResult.rows[0];

  if (!activeSession || activeSession.user_id !== decoded.sub) {
    return { status: 401, body: { message: 'Session invalide' } };
  }

  const userResult = await query(
    `
    SELECT id, username, email, status
    FROM users
    WHERE id = $1
    LIMIT 1
    `,
    [decoded.sub],
  );

  const user = userResult.rows[0];

  if (!user || user.status !== 'active') {
    return { status: 403, body: { message: 'Compte inactif' } };
  }

  await query('UPDATE auth_sessions SET revoked_at = NOW() WHERE id = $1', [activeSession.id]);
  const session = await issueSessionTokens(user, metadata);

  return {
    status: 200,
    body: {
      message: 'Session renouvelee',
      ...session,
    },
  };
};

const logout = async ({ refreshToken }) => {
  if (!refreshToken) {
    return { status: 400, body: { message: 'refreshToken requis' } };
  }

  const refreshTokenHash = sha256(refreshToken);

  await query(
    `
    UPDATE auth_sessions
    SET revoked_at = NOW()
    WHERE refresh_token_hash = $1
      AND revoked_at IS NULL
    `,
    [refreshTokenHash],
  );

  return {
    status: 200,
    body: { message: 'Deconnexion effectuee' },
  };
};

module.exports = {
  register,
  login,
  refresh,
  logout,
};
