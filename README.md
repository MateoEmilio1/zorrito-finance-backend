# Filecoin Synapse SDK - Image Storage Test

This project demonstrates how to use the **Filecoin Synapse SDK** to upload and download images to/from Filecoin's decentralized storage network.

## 🎯 What is Filecoin Synapse SDK?

The Synapse SDK is your gateway to **Filecoin Onchain Cloud** — a decentralized, programmable cloud platform. Think of it like AWS S3, but:

- **Decentralized**: Your data is stored across multiple independent providers
- **Immutable**: Once uploaded, data gets a permanent address (PieceCID)
- **Pay-per-storage**: You only pay for what you store
- **Censorship-resistant**: No single entity controls your data

## 📚 How It Works (Step by Step)

### 1. **Initialization** 🔧
```typescript
const synapse = await Synapse.create({
  privateKey: "YOUR_PRIVATE_KEY",
  rpcURL: RPC_URLS.calibration.http,
});
```
- Connects to Filecoin's Calibration testnet
- Creates a wallet from your private key
- Sets up all necessary smart contracts and services

### 2. **Payment Setup** 💰
```typescript
// Get the storage service address
const storageInfo = await synapse.getStorageInfo();
const serviceAddress = storageInfo.serviceParameters.pandoraAddress;

// Deposit USDFC into payment account
await synapse.payments.deposit(depositAmount, TOKENS.USDFC);

// Approve the storage service to use your tokens
await synapse.payments.approveService(
  serviceAddress,      // Which storage service to approve
  rateAllowance,       // How much they can charge per epoch
  lockupAllowance,     // How much they can lock up
  TOKENS.USDFC
);
```
- **USDFC** is the payment token (like USDC, but for Filecoin)
- You deposit tokens into a payment account
- You approve the storage service to use your tokens
- These are done in separate transactions

### 3. **Upload** 📤
```typescript
// Create a storage service instance
const storageService = await synapse.createStorage();

// Upload your data
const { commp, size } = await storageService.upload(imageData);
```
- SDK automatically:
  - Selects a storage provider
  - Creates a data set if needed
  - Uploads your data
  - Returns a **PieceCID** (Content Identifier) as `commp`
- **PieceCID** is like a permanent URL - it's a hash of your data
- Minimum file size: **127 bytes**

### 4. **Download** 📥
```typescript
const data = await synapse.download(commp);
```
- Use the PieceCID to retrieve your data
- SDK finds providers that have your data
- Downloads and returns the original bytes

## 🚀 Quick Start

### Prerequisites

1. **Node.js 20+** installed
2. **MetaMask** with Calibration testnet added
3. **Test tokens** (see below)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env and add your private key
# PRIVATE_KEY=your_private_key_here
```

### Get Test Tokens

Before running, you need test tokens on the Calibration testnet:

1. **Get tFIL (for gas fees)**:
   - Visit: https://faucet.calibnet.chainsafe-fil.io/funds.html
   - Enter your wallet address
   - Receive free tFIL tokens

2. **Get USDFC (for storage payments)**:
   - Visit: https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc
   - Enter your wallet address
   - Receive free test USDFC tokens

### Run the Test

```bash
# Run the image upload test
npm run test:image
```

Or use the dev script:
```bash
npm run dev
```

## 📁 Project Structure

```
.
├── src/
│   ├── test-image-upload.ts  # Main test script
│   └── utils/
│       └── image-helpers.ts    # Image utility functions
├── .env.example                # Environment variables template
├── package.json
└── README.md
```

## 🔑 Key Concepts

### PieceCID
- A unique identifier (hash) for your data
- Like a permanent URL that never changes
- Used to retrieve your data from any provider

### Decentralized Storage
- Your data is stored across multiple independent providers
- More reliable than single-server storage
- No single point of failure

### Payment Model
- **Deposit**: Put USDFC tokens into your payment account
- **Approval**: Allow storage service to use your tokens
- **Automatic billing**: Service charges you based on storage used

### Minimum File Size
- Files must be at least **127 bytes**
- This is a Filecoin network requirement

## 🧪 Testing with Your Own Images

1. Place an image file named `test-image.jpg` in the project root
2. Run `npm run test:image`
3. The script will:
   - Upload your image
   - Show you the PieceCID
   - Download it back
   - Save it to `downloaded-images/` folder

## 📝 Environment Variables

Create a `.env` file with:

```env
PRIVATE_KEY=your_private_key_here
```

**⚠️ IMPORTANT**: Never commit your `.env` file or private key to version control!

## 🐛 Troubleshooting

### "Insufficient funds" error
- Make sure you have both tFIL (for gas) and USDFC (for storage)
- Get tokens from the faucets mentioned above

### "Image is too small" error
- Files must be at least 127 bytes
- Most images are much larger, so this shouldn't be an issue

### Upload/download taking too long
- This is normal! The SDK needs to:
  - Find and select a provider
  - Upload/retrieve data from decentralized storage
  - Wait for blockchain confirmations
- Expect 30-60 seconds for uploads

## 🔗 Useful Links

- [Synapse SDK Documentation](https://docs.filoz.io/)
- [Filecoin Calibration Faucet](https://faucet.calibnet.chainsafe-fil.io/funds.html)
- [USDFC Faucet](https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc)
- [Filecoin Explorer](https://calibration.filfox.info/)

## 📖 Next Steps

Once you understand the basics, you can explore:

- **Advanced Storage**: CDN integration, metadata management, batch operations
- **Payment Management**: Cost estimation, allowance management
- **Provider Selection**: Choose specific providers for your data
- **Session Keys**: Improve UX with delegated signing

## 🤝 Support

- **GitHub**: [Report issues](https://github.com/FilOzone/synapse-sdk)
- **Slack**: Join `#fil-builders` on [Filecoin Slack](https://filecoin.io/slack)
- **Telegram**: Join [FIL Builders](https://t.me/+Xj6_zTPfcUA4MGQ1)

## 📄 License

MIT

