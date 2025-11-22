# 🚀 Quick Start Guide - Filecoin Image Storage

This is a simplified guide to get you up and running with Filecoin image storage in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Get Test Tokens

You need two types of tokens on the Calibration testnet:

1. **tFIL** (for gas fees) - Get from: https://faucet.calibnet.chainsafe-fil.io/funds.html
2. **USDFC** (for storage payments) - Get from: https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc

Enter your wallet address at both faucets and wait for the tokens to arrive.

## Step 3: Setup Environment

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your private key:

```
PRIVATE_KEY=your_private_key_here
```

⚠️ **Never commit your `.env` file or private key!**

## Step 4: Run the Test

```bash
npm run test:image
```

That's it! The script will:
1. ✅ Connect to Filecoin Calibration testnet
2. ✅ Check your wallet balance
3. ✅ Deposit and approve USDFC tokens
4. ✅ Upload your image (or create a sample if none exists)
5. ✅ Download the image back
6. ✅ Save it to `downloaded-images/` folder

## What Happens Behind the Scenes?

### 1. **Initialization** 🔧
- SDK connects to Filecoin's Calibration testnet
- Creates a wallet from your private key
- Sets up smart contracts for payments and storage

### 2. **Payment Setup** 💰
- Deposits USDFC tokens into your payment account
- Approves the storage service (Pandora) to charge you for storage
- This allows automatic billing as you store data

### 3. **Upload** 📤
- SDK selects a storage provider automatically
- Creates a "proof set" (data set) if this is your first upload
- Uploads your image to the provider
- Returns a **PieceCID** - this is your image's permanent address

### 4. **Download** 📥
- Uses the PieceCID to find providers that have your data
- Downloads the image from the provider
- Returns the original bytes

## Understanding PieceCID

**PieceCID** (Content Identifier) is like a permanent URL for your data:
- It's a cryptographic hash of your file
- It never changes - same file = same PieceCID
- You can use it to retrieve your data anytime, from anywhere
- It's stored on the blockchain for verification

## Testing with Your Own Images

1. Place any image file named `test-image.jpg` in the project root
2. Run `npm run test:image`
3. Your image will be uploaded and downloaded

## Common Issues

### "Insufficient funds"
- Make sure you have both tFIL and USDFC tokens
- Get them from the faucets mentioned in Step 2

### "PRIVATE_KEY not found"
- Make sure you created a `.env` file
- Check that it contains `PRIVATE_KEY=your_key_here`

### Upload takes a long time
- This is normal! Uploads can take 30-60 seconds
- The SDK needs to select a provider, upload data, and wait for blockchain confirmations

## Next Steps

Once you understand the basics:
- Check out `src/test-image-upload.ts` for the full code with detailed comments
- Read `README.md` for more advanced features
- Explore the [Synapse SDK Documentation](https://docs.filoz.io/)

Happy coding! 🎉

