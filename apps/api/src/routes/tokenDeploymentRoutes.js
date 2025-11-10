const express = require('express');
const router = express.Router();
const tokenDeploymentController = require('../controllers/tokenDeploymentController');
const { authenticate } = require('../middleware/authMiddleware');
const cacheMiddleware = require('../middleware/cacheMiddleware');

router.get('/price', tokenDeploymentController.getDeploymentPrice);

router.post(
  '/deploy',
  authenticate,
  tokenDeploymentController.uploadMiddleware,
  tokenDeploymentController.requestDeployment
);

router.get('/status/:deploymentId', authenticate, tokenDeploymentController.getDeploymentStatus);

router.get('/my-deployments', authenticate, tokenDeploymentController.getUserDeployments);

router.get('/all', cacheMiddleware('tokens', 30), tokenDeploymentController.getAllDeployments);

router.get('/token/:mintAddress', tokenDeploymentController.getTokenByMint);

module.exports = router;
