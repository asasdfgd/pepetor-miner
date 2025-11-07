const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { Keypair, Connection, clusterApiUrl, PublicKey } = require('@solana/web3.js');
const { Metaplex, keypairIdentity, bundlrStorage } = require('@metaplex-foundation/js');
const fs = require('fs');

async function uploadMetadata() {
  console.log('📤 UPLOADING $PEPETOR METADATA TO ARWEAVE\n');
  
  const NETWORK = process.env.SOLANA_NETWORK || 'mainnet-beta';
  const MINT_ADDRESS = process.env.PEPETOR_MINT_ADDRESS;
  
  if (!MINT_ADDRESS) {
    console.error('❌ PEPETOR_MINT_ADDRESS not set in .env');
    console.error('   Deploy the token first with: node scripts/deployToken.js');
    process.exit(1);
  }
  
  const connection = new Connection(clusterApiUrl(NETWORK), 'confirmed');
  
  const deployerPath = path.join(__dirname, '../.wallets/deployer.json');
  if (!fs.existsSync(deployerPath)) {
    console.error('❌ Deployer wallet not found at .wallets/deployer.json');
    console.error('   Deploy the token first with: node scripts/deployToken.js');
    process.exit(1);
  }
  
  const deployerData = JSON.parse(fs.readFileSync(deployerPath, 'utf-8'));
  const deployer = Keypair.fromSecretKey(new Uint8Array(deployerData));
  
  console.log('🔐 Update Authority:', deployer.publicKey.toString());
  console.log('🪙 Token Mint:', MINT_ADDRESS);
  console.log('🌐 Network:', NETWORK);
  console.log('');
  
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(deployer))
    .use(bundlrStorage({
      address: NETWORK === 'mainnet-beta' 
        ? 'https://node1.bundlr.network' 
        : 'https://devnet.bundlr.network',
      providerUrl: clusterApiUrl(NETWORK),
      timeout: 60000,
    }));
  
  const logoPath = path.join(__dirname, 'pepetor-logo.png');
  if (!fs.existsSync(logoPath)) {
    console.error('❌ Logo not found at scripts/pepetor-logo.png');
    console.error('');
    console.error('   Please add your logo:');
    console.error('   1. Create a 512x512 PNG logo');
    console.error('   2. Save as: apps/api/scripts/pepetor-logo.png');
    console.error('   3. Run this script again');
    console.error('');
    console.error('   💡 Tip: Use https://www.canva.com or hire on Fiverr');
    process.exit(1);
  }
  
  console.log('📤 Step 1: Uploading logo to Arweave...');
  const imageBuffer = fs.readFileSync(logoPath);
  const imageFile = {
    buffer: imageBuffer,
    fileName: 'pepetor-logo.png',
    displayName: 'PEPETOR Logo',
    uniqueName: 'pepetor-logo',
    contentType: 'image/png',
    extension: 'png',
    tags: [{ name: 'Content-Type', value: 'image/png' }],
  };
  
  const imageUri = await metaplex.storage().upload(imageFile);
  console.log('✅ Logo uploaded:', imageUri);
  console.log('');
  
  console.log('📤 Step 2: Uploading metadata JSON...');
  const metadata = {
    name: 'PEPETOR',
    symbol: 'PEPETOR',
    description: 'The official token for PEPETOR Miner - Earn $PEPETOR by running Tor nodes and contributing to the decentralized internet.',
    image: imageUri,
    external_url: 'https://clearnetlabs.fun',
    attributes: [
      { trait_type: 'Type', value: 'Utility Token' },
      { trait_type: 'Network', value: 'Solana' },
      { trait_type: 'Supply', value: '1,000,000,000' },
    ],
    properties: {
      files: [
        {
          uri: imageUri,
          type: 'image/png',
        },
      ],
      category: 'image',
      creators: [
        {
          address: deployer.publicKey.toString(),
          share: 100,
        },
      ],
    },
  };
  
  const metadataUri = await metaplex.storage().uploadJson(metadata);
  console.log('✅ Metadata uploaded:', metadataUri);
  console.log('');
  
  console.log('📝 Step 3: Creating on-chain metadata account...');
  
  try {
    const mintAddress = new PublicKey(MINT_ADDRESS);
    
    const { nft } = await metaplex.nfts().create({
      uri: metadataUri,
      name: 'PEPETOR',
      sellerFeeBasisPoints: 0,
      symbol: 'PEPETOR',
      creators: [
        {
          address: deployer.publicKey,
          share: 100,
        },
      ],
      isMutable: true,
      maxSupply: null,
      useNewMint: mintAddress,
    });
    
    console.log('✅ Metadata account created!');
    console.log('');
    console.log('🎉 TOKEN METADATA COMPLETE!\n');
    console.log('📋 Summary:');
    console.log('   Logo URI:', imageUri);
    console.log('   Metadata URI:', metadataUri);
    console.log('   Mint Address:', MINT_ADDRESS);
    console.log('');
    console.log('🔗 View on Solana Explorer:');
    console.log(`   https://explorer.solana.com/address/${MINT_ADDRESS}?cluster=${NETWORK}`);
    console.log('');
    console.log('✅ Wallets will now display your logo and token info!');
    
  } catch (error) {
    if (error.message.includes('already in use')) {
      console.log('ℹ️  Metadata account already exists. Updating...');
      
      const mintAddress = new PublicKey(MINT_ADDRESS);
      const nft = await metaplex.nfts().findByMint({ mintAddress });
      
      await metaplex.nfts().update({
        nftOrSft: nft,
        uri: metadataUri,
      });
      
      console.log('✅ Metadata updated!');
      console.log('');
      console.log('🎉 TOKEN METADATA COMPLETE!\n');
      console.log('📋 Summary:');
      console.log('   Logo URI:', imageUri);
      console.log('   Metadata URI:', metadataUri);
      console.log('   Mint Address:', MINT_ADDRESS);
      console.log('');
      console.log('✅ Wallets will now display your updated logo!');
      
    } else {
      throw error;
    }
  }
}

uploadMetadata().catch((error) => {
  console.error('❌ Error uploading metadata:', error.message);
  console.error(error);
  process.exit(1);
});
