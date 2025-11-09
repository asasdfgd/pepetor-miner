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
    const { paymentMethod = 'SOL', liquidityAmount = 0 } = req.query;
    
    const deploymentPrice = await tokenDeploymentService.getDeploymentPrice(paymentMethod);
    const solPrice = await tokenDeploymentService.fetchSOLPrice();
    const treasuryWallet = process.env.TREASURY_WALLET_ADDRESS || 'Not configured';
    
    const liquidity = parseFloat(liquidityAmount) || 0;
    const marketCreationCost = liquidity > 0 ? 0.4 : 0;
    const totalPrice = deploymentPrice + liquidity + marketCreationCost;
    
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
    } = req.body;

    if (!tokenName || !tokenSymbol || !paymentSignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: tokenName, tokenSymbol, paymentSignature',
      });
    }

    const owner = req.user?.walletAddress;
    if (!owner) {
      return res.status(401).json({
        success: false,
        message: 'Wallet authentication required',
      });
    }

    const existingDeployment = await DeployedToken.findOne({
      paymentSignature,
    });

    if (existingDeployment) {
      return res.status(400).json({
        success: false,
        message: 'Payment signature already used',
      });
    }

    const expectedAmount = await tokenDeploymentService.getDeploymentPrice(paymentMethod);
    
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
    const result = await tokenDeploymentService.deployCustomToken(config);

    await DeployedToken.findByIdAndUpdate(deploymentId, {
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
      deployedAt: new Date(),
    });

    console.log(`✅ Token deployed successfully: ${result.mintAddress}`);
    if (result.metadataUri) {
      console.log(`📤 Metadata uploaded: ${result.metadataUri}`);
    }
  } catch (error) {
    console.error('Error deploying token:', error);
    
    await DeployedToken.findByIdAndUpdate(deploymentId, {
      status: 'failed',
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

    if (deployment.owner !== req.user?.walletAddress) {
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
    const owner = req.user?.walletAddress;
    
    if (!owner) {
      return res.status(401).json({
        success: false,
        message: 'Wallet authentication required',
      });
    }

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
