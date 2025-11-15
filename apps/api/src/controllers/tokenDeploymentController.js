const DeployedToken = require('../models/DeployedToken');
const tokenDeploymentService = require('../services/tokenDeploymentService');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
      cb(null, true);
    } else {
      cb(new Error('Only PNG and JPEG images are allowed'));
    }
  },
});

exports.uploadMiddleware = upload.single('logo');

exports.getDeploymentPrice = async (req, res) => {
  try {
    const { paymentMethod = 'SOL', liquidityAmount = 0, useBondingCurve = 'false', initialPurchaseAmount = 0 } = req.query;
    
    console.log('🔍 /price endpoint received query params:', req.query);
    console.log('📊 Parsed values:', { paymentMethod, liquidityAmount, useBondingCurve, initialPurchaseAmount });
    
    const deploymentPrice = await tokenDeploymentService.getDeploymentPrice(paymentMethod);
    const solPrice = await tokenDeploymentService.fetchSOLPrice();
    const treasuryWallet = process.env.TREASURY_WALLET_ADDRESS || 'Not configured';
    
    const isBondingCurve = useBondingCurve === 'true';
    
    if (isBondingCurve) {
      const initialPurchase = parseFloat(initialPurchaseAmount) || 0;
      console.log('💰 Bonding curve pricing calculation:', {
        deploymentPrice,
        initialPurchaseAmount,
        initialPurchaseType: typeof initialPurchaseAmount,
        parsedInitialPurchase: initialPurchase,
      });
      const totalPrice = parseFloat((deploymentPrice + initialPurchase).toFixed(9));
      const priceUSD = paymentMethod === 'SOL' ? totalPrice * solPrice : null;
      
      const breakdown = [
        `Deployment: ${deploymentPrice} SOL`,
        `Bonding Curve Pool: Free`,
      ];
      
      if (initialPurchase > 0) {
        breakdown.push(`Initial Buy: ${initialPurchase} SOL`);
      }
      
      breakdown.push(`Total: ${totalPrice} SOL (~$${priceUSD.toFixed(2)} USD)`);
      
      return res.json({
        success: true,
        paymentMethod,
        deploymentPrice,
        liquidityAmount: 0,
        marketCreationCost: 0,
        initialPurchaseAmount: initialPurchase,
        totalPrice,
        priceUSD: priceUSD ? parseFloat(priceUSD.toFixed(2)) : null,
        solPrice,
        treasuryWallet,
        launchType: 'bonding_curve',
        breakdown,
        note: initialPurchase > 0 
          ? `Token launches on bonding curve with ${initialPurchase} SOL initial buy. Auto-graduates to DEX at 85 SOL market cap.`
          : 'Token launches on bonding curve - no upfront liquidity needed. Auto-graduates to DEX at 85 SOL market cap.',
      });
    }
    
    const liquidity = parseFloat(liquidityAmount) || 0;
    const marketCreationCost = liquidity > 0 ? 0.4 : 0;
    const totalPrice = parseFloat((deploymentPrice + liquidity + marketCreationCost).toFixed(9));
    
    const priceUSD = paymentMethod === 'SOL' ? totalPrice * solPrice : null;
    
    res.json({
      success: true,
      paymentMethod,
      deploymentPrice,
      liquidityAmount: liquidity,
      marketCreationCost,
      totalPrice,
      priceUSD: priceUSD ? parseFloat(priceUSD.toFixed(2)) : null,
      solPrice,
      treasuryWallet,
      launchType: 'traditional',
      breakdown: liquidity > 0 ? [
        `Deployment: ${deploymentPrice} SOL`,
        `Liquidity: ${liquidity} SOL`,
        `OpenBook Market: ${marketCreationCost} SOL`,
        `Total: ${totalPrice} SOL (~$${priceUSD.toFixed(2)} USD)`,
      ] : null,
      note: paymentMethod === 'PEPETOR' 
        ? 'PEPETOR payment coming soon after mainnet launch'
        : liquidity > 0
          ? `Instant DEX launch with ${liquidity} SOL liquidity (LP tokens will be burned)`
          : `Token deployment only - add liquidity manually later`,
    });
  } catch (error) {
    console.error('Error getting deployment price:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get deployment price',
      error: error.message,
    });
  }
};

exports.requestDeployment = async (req, res) => {
  try {
    const {
      tokenName,
      tokenSymbol,
      totalSupply = 1_000_000_000,
      decimals = 9,
      description,
      paymentSignature,
      paymentMethod = 'SOL',
      allocations,
      createPool,
      poolLiquiditySOL,
      website,
      twitter,
      walletAddress,
      useBondingCurve,
      bondingCurveInitialMC,
      bondingCurveMigrationMC,
      initialPurchaseAmount,
    } = req.body;

    if (!tokenName || !tokenSymbol || !paymentSignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: tokenName, tokenSymbol, paymentSignature',
      });
    }

    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (!user || !user.walletAddress) {
      return res.status(401).json({
        success: false,
        message: 'Wallet authentication required',
      });
    }
    const owner = user.walletAddress;

    const existingDeployment = await DeployedToken.findOne({
      paymentSignature,
    });

    if (existingDeployment) {
      return res.status(400).json({
        success: false,
        message: 'Payment signature already used',
      });
    }

    const deploymentPrice = await tokenDeploymentService.getDeploymentPrice(paymentMethod);
    const initialPurchase = initialPurchaseAmount ? parseFloat(initialPurchaseAmount) : 0;
    const expectedAmount = deploymentPrice + initialPurchase;
    
    console.log('💵 Payment amount calculation:', {
      deploymentPrice,
      initialPurchaseAmount,
      initialPurchase,
      expectedAmount,
      paymentSignature,
    });
    
    const paymentValid = await tokenDeploymentService.verifyPayment(
      paymentSignature,
      expectedAmount,
      paymentMethod
    );

    if (!paymentValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment. Please ensure you sent the correct amount.',
      });
    }

    const logoBuffer = req.file?.buffer || null;

    const deployment = new DeployedToken({
      owner,
      tokenName,
      tokenSymbol,
      totalSupply,
      decimals,
      description,
      paymentMethod,
      paymentAmount: expectedAmount,
      paymentSignature,
      status: 'pending',
      network: process.env.SOLANA_NETWORK || 'mainnet-beta',
    });

    await deployment.save();

    deployTokenAsync(deployment._id, {
      tokenName,
      tokenSymbol,
      totalSupply,
      decimals,
      ownerPublicKey: owner,
      allocations,
      description,
      logoBuffer,
      createPool: createPool === 'true' || createPool === true,
      poolLiquiditySOL: poolLiquiditySOL ? parseFloat(poolLiquiditySOL) : 2,
      website,
      twitter,
      walletAddress,
      useBondingCurve: useBondingCurve === 'true' || useBondingCurve === true,
      bondingCurveInitialMC: bondingCurveInitialMC ? parseFloat(bondingCurveInitialMC) : 30,
      bondingCurveMigrationMC: bondingCurveMigrationMC ? parseFloat(bondingCurveMigrationMC) : 85,
      initialPurchaseAmount: initialPurchaseAmount ? parseFloat(initialPurchaseAmount) : 0,
    });

    res.json({
      success: true,
      message: 'Token deployment initiated',
      deploymentId: deployment._id,
      status: 'pending',
      estimatedTime: logoBuffer ? '3-7 minutes' : '2-5 minutes',
    });

  } catch (error) {
    console.error('Error requesting deployment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request deployment',
      error: error.message,
    });
  }
};

async function deployTokenAsync(deploymentId, config) {
  try {
    console.log(`🚀 Starting token deployment for ID: ${deploymentId}`);
    const result = await tokenDeploymentService.deployCustomToken(config);

    const deployment = await DeployedToken.findByIdAndUpdate(deploymentId, {
      status: 'deployed',
      mintAddress: result.mintAddress,
      treasuryWallet: result.treasuryWallet,
      rewardsWallet: result.rewardsWallet,
      liquidityWallet: result.liquidityWallet,
      marketingWallet: result.marketingWallet,
      treasuryKeypair: result.treasuryKeypair,
      rewardsKeypair: result.rewardsKeypair,
      liquidityKeypair: result.liquidityKeypair,
      marketingKeypair: result.marketingKeypair,
      metadataUri: result.metadataUri,
      marketId: result.marketId,
      poolAddress: result.poolAddress,
      deploymentSignature: result.deploymentSignature,
      useBondingCurve: result.useBondingCurve,
      bondingCurvePool: result.bondingCurvePool,
      bondingCurveConfig: result.bondingCurveConfig,
      bondingCurveInitialMC: result.bondingCurveInitialMC,
      bondingCurveMigrationMC: result.bondingCurveMigrationMC,
      tradingUrl: result.tradingUrl,
      deployedAt: new Date(),
    }, { new: true });

    console.log(`✅ Token deployed successfully: ${result.mintAddress}`);
    if (result.metadataUri) {
      console.log(`📤 Metadata uploaded: ${result.metadataUri}`);
    }

    // Award task reward: +100 PEPETOR for token creation
    try {
      const rewardService = require('../services/rewardService');
      const User = require('../models/User');
      
      // Find user by wallet address
      const user = await User.findOne({ walletAddress: deployment.owner });
      if (user) {
        await rewardService.awardTaskReward(user._id, 'tokenCreation');
        console.log(`🎁 Awarded 100 PEPETOR token creation reward to ${user.username}`);
      }
    } catch (rewardError) {
      console.error('Failed to award token creation reward:', rewardError);
      // Don't fail deployment if reward fails
    }
  } catch (error) {
    console.error('❌ Error deploying token:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error string:', String(error));
    console.error('Deployment ID:', deploymentId);
    
    const errorMessage = error.message || error.toString() || 'Unknown error occurred during deployment';
    
    await DeployedToken.findByIdAndUpdate(deploymentId, {
      status: 'failed',
      errorMessage: errorMessage,
    });
  }
}

exports.getDeploymentStatus = async (req, res) => {
  try {
    const { deploymentId } = req.params;
    
    const deployment = await DeployedToken.findById(deploymentId);
    
    if (!deployment) {
      return res.status(404).json({
        success: false,
        message: 'Deployment not found',
      });
    }

    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (!user || deployment.owner !== user.walletAddress) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.json({
      success: true,
      deployment: {
        id: deployment._id,
        tokenName: deployment.tokenName,
        tokenSymbol: deployment.tokenSymbol,
        totalSupply: deployment.totalSupply,
        mintAddress: deployment.mintAddress,
        status: deployment.status,
        treasuryWallet: deployment.treasuryWallet,
        rewardsWallet: deployment.rewardsWallet,
        liquidityWallet: deployment.liquidityWallet,
        marketingWallet: deployment.marketingWallet,
        treasuryKeypair: deployment.treasuryKeypair,
        rewardsKeypair: deployment.rewardsKeypair,
        liquidityKeypair: deployment.liquidityKeypair,
        marketingKeypair: deployment.marketingKeypair,
        marketId: deployment.marketId,
        poolAddress: deployment.poolAddress,
        deployedAt: deployment.deployedAt,
        network: deployment.network,
        errorMessage: deployment.errorMessage,
      },
    });
  } catch (error) {
    console.error('Error getting deployment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get deployment status',
      error: error.message,
    });
  }
};

exports.getUserDeployments = async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (!user || !user.walletAddress) {
      return res.status(401).json({
        success: false,
        message: 'Wallet authentication required',
      });
    }
    const owner = user.walletAddress;

    const deployments = await DeployedToken.find({ owner })
      .select('tokenName tokenSymbol mintAddress status deployedAt createdAt')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({
      success: true,
      count: deployments.length,
      deployments: deployments.map(d => ({
        id: d._id,
        tokenName: d.tokenName,
        tokenSymbol: d.tokenSymbol,
        mintAddress: d.mintAddress,
        status: d.status,
        deployedAt: d.deployedAt,
        createdAt: d.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error getting user deployments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get deployments',
      error: error.message,
    });
  }
};

exports.getAllDeployments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [deployments, total] = await Promise.all([
      DeployedToken.find({ status: 'deployed' })
        .select('owner tokenName tokenSymbol mintAddress logoUrl description deployedAt createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DeployedToken.countDocuments({ status: 'deployed' })
    ]);

    res.json({
      success: true,
      count: deployments.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      deployments: deployments.map(d => ({
        id: d._id,
        owner: d.owner,
        tokenName: d.tokenName,
        tokenSymbol: d.tokenSymbol,
        mintAddress: d.mintAddress,
        logoUrl: d.logoUrl,
        description: d.description,
        deployedAt: d.deployedAt,
        createdAt: d.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error getting all deployments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get deployments',
      error: error.message,
    });
  }
};

exports.getTokenByMint = async (req, res) => {
  try {
    const { mintAddress } = req.params;

    const token = await DeployedToken.findOne({ mintAddress }).lean();

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found',
      });
    }

    res.json({
      success: true,
      token,
    });
  } catch (error) {
    console.error('Error getting token by mint:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get token',
      error: error.message,
    });
  }
};
