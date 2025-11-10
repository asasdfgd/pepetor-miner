const express = require('express');
const router = express.Router();
const {
  createCommitment,
  confirmCommitment,
  getCommitmentsForToken,
  getUserCommitments,
  cancelCommitment,
  getCommitmentStats,
} = require('../controllers/liquidityCommitmentController');

router.post('/create', createCommitment);

router.post('/confirm', confirmCommitment);

router.get('/token/:tokenMint', getCommitmentsForToken);

router.get('/user/:walletAddress', getUserCommitments);

router.post('/cancel/:commitmentId', cancelCommitment);

router.get('/stats/:tokenMint', getCommitmentStats);

module.exports = router;
