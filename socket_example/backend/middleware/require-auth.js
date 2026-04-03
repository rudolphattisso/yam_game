const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_only_change_me';

const extractBearerToken = (authorizationHeader) => {
  if (typeof authorizationHeader !== 'string') {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
};

const requireAuth = (req, res, next) => {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    res.status(401).json({ message: 'Token manquant' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    if (payload?.type !== 'access' || !payload?.sub) {
      res.status(401).json({ message: 'Token invalide' });
      return;
    }

    req.auth = {
      userId: payload.sub,
      username: payload.username,
      email: payload.email,
    };

    next();
  } catch (_error) {
    res.status(401).json({ message: 'Token invalide ou expire' });
  }
};

module.exports = {
  requireAuth,
};
