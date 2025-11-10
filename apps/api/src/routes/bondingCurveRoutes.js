const express = require('express');
const router = express.Router();
const bondingCurveService = require('../services/bondingCurveService');

router.get('/pool/:address', async (req, res) => {
  try {
    const poolState = await bondingCurveService.getPoolState(req.params.address);
    res.json({ success: true, pool: poolState });
  } catch (error) {
    console.error('Failed to get pool state:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/quote', async (req, res) => {
  try {
    const { poolAddress, amountIn, swapBaseForQuote = false } = req.body;
    
    if (!poolAddress || !amountIn) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: poolAddress, amountIn',
      });
    }

    const quote = await bondingCurveService.getSwapQuote({
      poolAddress,
      amountIn,
      swapBaseForQuote,
    });
    
    res.json({ success: true, quote });
  } catch (error) {
    console.error('Failed to get swap quote:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
