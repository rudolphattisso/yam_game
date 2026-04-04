const { ZodError } = require('zod');

const formatIssues = (issues) => issues.map((issue) => ({
  path: issue.path.join('.'),
  message: issue.message,
}));

const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body || {});
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'invalid_request_body',
        message: 'Le corps de la requete est invalide',
        details: formatIssues(error.issues),
      });
      return;
    }

    next(error);
  }
};

const validateQuery = (schema) => (req, res, next) => {
  try {
    req.query = schema.parse(req.query || {});
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'invalid_query',
        message: 'Les parametres de requete sont invalides',
        details: formatIssues(error.issues),
      });
      return;
    }

    next(error);
  }
};

module.exports = {
  validateBody,
  validateQuery,
};