const express = require('express');
const authService = require('../services/auth.service');

const router = express.Router();

const getRequestMetadata = (req) => ({
  userAgent: req.headers['user-agent'],
  ipAddress: req.ip,
});

router.post('/register', async (req, res) => {
  try {
    const result = await authService.register(req.body, getRequestMetadata(req));
    res.status(result.status).json(result.body);
  } catch (error) {
    res.status(500).json({ message: `Erreur serveur: ${error.message}` });
  }
});

router.post('/login', async (req, res) => {
  try {
    const result = await authService.login(req.body, getRequestMetadata(req));
    res.status(result.status).json(result.body);
  } catch (error) {
    res.status(500).json({ message: `Erreur serveur: ${error.message}` });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const result = await authService.refresh(req.body, getRequestMetadata(req));
    res.status(result.status).json(result.body);
  } catch (error) {
    res.status(500).json({ message: `Erreur serveur: ${error.message}` });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const result = await authService.logout(req.body);
    res.status(result.status).json(result.body);
  } catch (error) {
    res.status(500).json({ message: `Erreur serveur: ${error.message}` });
  }
});

module.exports = router;
