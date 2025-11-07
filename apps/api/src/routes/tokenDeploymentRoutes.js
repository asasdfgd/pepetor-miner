const express = require('express');
const router = express.Router();
const tokenDeploymentController = require('../controllers/tokenDeploymentController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/price', tokenDeploymentController.getDeploymentPrice);

router.post(
  '/deploy',
  authenticateToken,
  tokenDeploymentController.uploadMiddleware,
  tokenDeploymentController.requestDeployment
);

router.get('/status/:deploymentId', authenticateToken, tokenDeploymentController.getDeploymentStatus);

router.get('/my-deployments', authenticateToken, tokenDeploymentController.getUserDeployments);

module.exports = router;
