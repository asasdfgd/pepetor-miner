const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

router.get('/dashboard', authenticate, requireAdmin, adminController.getDashboardStats);

router.get('/users', authenticate, requireAdmin, adminController.getAllUsers);

router.post('/users/:userId/ban', authenticate, requireAdmin, adminController.banUser);

router.post('/users/:userId/unban', authenticate, requireAdmin, adminController.unbanUser);

router.put('/users/:userId/role', authenticate, requireAdmin, adminController.updateUserRole);

router.get('/settings', authenticate, requireAdmin, adminController.getSystemSettings);

router.put('/settings/:key', authenticate, requireAdmin, adminController.updateSystemSetting);

module.exports = router;
