const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const miningController = require('../controllers/miningController');

// @route   GET api/mining/job
// @desc    Get a mining job
// @access  Private
router.get('/job', authenticate, miningController.getJob);

// @route   POST api/mining/submit
// @desc    Submit a solved hash
// @access  Private
router.post('/submit', authenticate, miningController.submitHash);

// @route   GET api/mining/stats
// @desc    Get user mining stats
// @access  Private
router.get('/stats', authenticate, miningController.getStats);

module.exports = router;