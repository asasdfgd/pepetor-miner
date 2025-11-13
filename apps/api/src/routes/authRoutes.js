const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

// Auth endpoints
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/wallet-auth', authController.walletAuth);
router.post('/link-wallet', authenticate, authController.linkWallet);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.post('/tutorial-seen', authenticate, authController.markTutorialSeen);

module.exports = router;