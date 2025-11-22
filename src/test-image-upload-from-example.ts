/**
 * Filecoin Synapse SDK - Image Upload Test (from local example image)
 *
 * Flujo:
 * 1. Inicializar Synapse SDK (Calibration)
 * 2. Chequear balance de USDFC
 * 3. Depositar USDFC + aprobar Warm Storage (1 sola tx)
 * 4. Leer una imagen de ejemplo desde sample-images/ (o crear fallback mínima)
 * 5. Subir la imagen con synapse.storage.upload
 * 6. Descargar la imagen con synapse.storage.download
 * 7. Guardar la imagen descargada en disco
 */

import { Synapse, RPC_URLS, TOKENS, TIME_CONSTANTS } from "@filoz/synapse-sdk";
import { ethers } from "ethers";
import { config } from "dotenv";
import {
  readImageFile,
  saveImageFile,
  validateImageSize,
} from "./utils/image-helpers.js";
import { join } from "path";
import { existsSync } from "fs";

// Cargar variables de entorno
config();

async function main() {
  console.log(
    "🚀 Starting Filecoin Synapse SDK Image Upload Test (from example image)\n"
  );

  // ============================================
  // STEP 1: Initialize the Synapse SDK
  // ============================================
  console.log("📦 Step 1: Initializing Synapse SDK...");

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error(
      "❌ PRIVATE_KEY not found in .env file.\n" +
        "Please create a .env file with your private key.\n" +
        "See .env.example for reference."
    );
  }

  const rpcURL = process.env.RPC_URL || RPC_URLS.calibration.http;
  console.log(`🔗 Using RPC: ${rpcURL}`);

  const synapse = await Synapse.create({
    privateKey,
    rpcURL,
  });

  console.log("✅ SDK initialized successfully!");
  console.log("📍 Connected to: Calibration Testnet\n");

  // ============================================
  // STEP 2: Check Wallet Balance (USDFC)
  // ============================================
  console.log("💰 Step 2: Checking wallet USDFC balance...");

  let walletBalance: bigint;
  try {
    walletBalance = await synapse.payments.walletBalance(TOKENS.USDFC);
  } catch (error: any) {
    console.log(
      "⚠️  Warning: Could not check USDFC balance (RPC issue or no tokens yet)"
    );
    console.log("   This is okay if you haven't received USDFC tokens yet.");
    console.log("   Continuing with balance check skipped...\n");
    walletBalance = BigInt(0);
  }

  const formattedBalance = ethers.formatUnits(walletBalance, 18);
  console.log(`💵 Current USDFC balance: ${formattedBalance} USDFC`);

  // Puedes ajustar el monto; 0.5 USDFC alcanza para tests chicos
  const depositAmount = ethers.parseUnits("0.5", 18);

  if (walletBalance < depositAmount) {
    console.log("\n" + "=".repeat(60));
    console.log("❌ INSUFFICIENT USDFC BALANCE");
    console.log("=".repeat(60));
    console.log();
    console.log(`💵 Current balance: ${formattedBalance} USDFC`);
    console.log(`💰 Required: ${ethers.formatUnits(depositAmount, 18)} USDFC`);
    console.log();
    console.log("📝 Para obtener USDFC:");
    console.log("   1. Abre este link:");
    console.log(
      "      https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc"
    );
    console.log();
    console.log("   2. Pega tu dirección de wallet:");
    console.log(`      ${await synapse.getSigner().getAddress()}`);
    console.log();
    console.log("   3. Solicita los tokens y espera 1-2 minutos");
    console.log();
    console.log("   4. Verifica que llegaron: npm run get-usdfc");
    console.log();
    console.log("   5. Ejecuta este test de nuevo: npm run test:image:example");
    console.log();
    console.log("=".repeat(60));
    throw new Error("Insufficient USDFC balance for deposit.");
  }

  console.log("✅ Sufficient balance for testing\n");

  // ============================================
  // STEP 3: Deposit + Approve Warm Storage (1 tx)
  // ============================================
  console.log("💳 Step 3: Depositing USDFC and approving Warm Storage...");

  try {
    const warmStorageAddress = synapse.getWarmStorageAddress();

    console.log(
      `💸 Depositing ${ethers.formatUnits(
        depositAmount,
        18
      )} USDFC & approving Warm Storage (${warmStorageAddress})...`
    );
    console.log(
      "   (This is a single tx: depositWithPermitAndApproveOperator, wait for confirmation...)"
    );

    const tx = await synapse.payments.depositWithPermitAndApproveOperator(
      depositAmount, // USDFC amount
      warmStorageAddress, // Warm Storage service address
      ethers.MaxUint256, // Rate allowance
      ethers.MaxUint256, // Lockup allowance
      TIME_CONSTANTS.EPOCHS_PER_MONTH // Lockup period (~30 days)
    );

    await tx.wait();
    console.log(
      "✅ USDFC deposit and Warm Storage service approval successful!\n"
    );
  } catch (error: any) {
    console.log("\n❌ ERROR during deposit/approval:");
    console.log("   Message:", error.message);
    throw error;
  }

  // ============================================
  // STEP 4: Prepare Image Data (from sample-images/foxExample.jpeg)
  // ============================================
  console.log("📤 Step 4: Preparing image data from local example...");

  // Carpeta de imágenes de ejemplo
  const IMAGES_DIR = join(process.cwd(), "sample-images");

  // Nombre por defecto: foxExample.jpeg (puede venir de .env)
  const imageFileName = process.env.TEST_IMAGE_NAME || "foxExample.jpeg";
  const imagePath = join(IMAGES_DIR, imageFileName);

  let imageData: Uint8Array;

  if (existsSync(imagePath)) {
    console.log(`📷 Reading REAL image from: ${imagePath}`);
    imageData = await readImageFile(imagePath);
  } else {
    console.log(
      "⚠️  Real image not found, falling back to minimal sample JPEG..."
    );
    console.log(`   Tried path: ${imagePath}`);
    console.log(
      "   To use a real image, put a file there or set TEST_IMAGE_NAME in .env\n"
    );

    // JPEG mínimo > 127 bytes
    const minimalJpeg = new Uint8Array([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
      0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
      0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
      0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20,
      0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29,
      0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32,
      0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x00, 0x01,
      0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
      0xff, 0xc4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xff, 0xda,
    ]);

    imageData = minimalJpeg;
    console.log("✅ Sample image created as fallback\n");
  }

  // Validar tamaño mínimo (127 bytes)
  validateImageSize(imageData);
  console.log(
    `📊 Image size: ${imageData.length} bytes (${(
      imageData.length / 1024
    ).toFixed(2)} KB)\n`
  );

  // ============================================
  // STEP 5: Upload Image (High-level Storage API)
  // ============================================
  console.log("📤 Step 5: Uploading image to Filecoin (Warm Storage)...");
  console.log(
    "   (SDK will handle provider selection, data set, and upload behind the scenes...)"
  );

  const { pieceCid, size } = await synapse.storage.upload(imageData);

  console.log("✅ Upload complete!");
  console.log(`   📋 PieceCID: ${pieceCid}`);
  console.log(
    `   📊 Reported size: ${size} bytes (${(size / 1024).toFixed(2)} KB)\n`
  );

  // ============================================
  // STEP 6: Download Image
  // ============================================
  console.log("📥 Step 6: Downloading image from Filecoin...");
  console.log(`   🔍 Using PieceCID: ${pieceCid}`);
  console.log(
    "   (SDK will find a provider that has the data and download it...)"
  );

  const downloadedData = await synapse.storage.download(pieceCid);

  console.log("✅ Download complete!");
  console.log(
    `   📊 Downloaded size: ${downloadedData.length} bytes (${(
      downloadedData.length / 1024
    ).toFixed(2)} KB)\n`
  );

  // Verificación básica de integridad
  if (downloadedData.length !== imageData.length) {
    console.warn(
      "⚠️  Warning: Downloaded size doesn't match original size (this can still be fine, pero revisalo)."
    );
  } else {
    console.log("✅ Data integrity check: sizes match!\n");
  }

  // ============================================
  // STEP 7: Save Downloaded Image
  // ============================================
  console.log("💾 Step 7: Saving downloaded image to disk...");

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputFilename = `downloaded-from-example-${timestamp}.jpg`;

  await saveImageFile(downloadedData, outputFilename);

  console.log("\n" + "=".repeat(60));
  console.log(
    "🎉 SUCCESS! Example image storage and retrieval test completed!"
  );
  console.log("=".repeat(60));
  console.log("\n📝 Summary:");
  console.log(`   • Image uploaded via synapse.storage.upload`);
  console.log(`   • PieceCID: ${pieceCid}`);
  console.log(`   • Original size: ${imageData.length} bytes`);
  console.log(`   • Reported size: ${size} bytes`);
  console.log(`   • Image downloaded via synapse.storage.download`);
  console.log(`   • Saved as: ${outputFilename}`);
  console.log(
    "   • Your example image is now stored on Filecoin's decentralized Warm Storage!\n"
  );
}

// Run the test
main()
  .then(() => {
    console.log("✅ Test completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error occurred:");
    console.error("   Message:", error.message);
    if (error.cause) {
      console.error("   Cause:", error.cause);
    }
    if (error.stack) {
      console.error("\n   Stack trace:");
      console.error(error.stack);
    }
    process.exit(1);
  });
