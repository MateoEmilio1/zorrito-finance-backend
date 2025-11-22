/**
 * Filecoin Synapse SDK - Image Upload Test (Warm Storage + StorageContext reutilizando DataSet)
 *
 * Flujo:
 * 1. Inicializar Synapse SDK (Calibration)
 * 2. Chequear balance de USDFC en la wallet
 * 3. Depositar USDFC + aprobar Warm Storage (1 sola tx)
 * 4. Leer/crear una imagen de prueba (>= 127 bytes)
 * 5. Crear un StorageContext reutilizando un DataSet existente
 * 6. Subir la imagen con context.upload
 * 7. Ver el estado de la pieza (pieceStatus) y posible retrievalUrl
 * 8. Descargar la imagen con context.download
 * 9. Guardar la imagen descargada en disco
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

// DataSet existente descubierto con status:storage
// Podés mover estos valores a .env si querés:
// DATASET_ID=2056
// DATASET_PROVIDER_ID=9
const EXISTING_DATASET_ID = Number(process.env.DATASET_ID ?? "2056");
const EXISTING_PROVIDER_ID = Number(process.env.DATASET_PROVIDER_ID ?? "9");

async function main() {
  console.log(
    "🚀 Starting Filecoin Synapse SDK Image Upload Test (Warm Storage + StorageContext, reusing DataSet)\n"
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
  console.log(`💵 Current USDFC balance in wallet: ${formattedBalance} USDFC`);

  // Ajustable; 0.5 USDFC alcanza para tests chicos
  const depositAmount = ethers.parseUnits("0.5", 18);

  if (walletBalance < depositAmount) {
    console.log("\n" + "=".repeat(60));
    console.log("❌ INSUFFICIENT USDFC BALANCE IN WALLET");
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
    console.log("   5. Ejecuta este test de nuevo: npm run test:image");
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
      // La función asume USDFC como token de pago.
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
  // STEP 4: Prepare Image Data
  // ============================================
  console.log("📤 Step 4: Preparing image data...");

  const testImagePath = join(process.cwd(), "test-image.jpg");
  let imageData: Uint8Array;

  if (existsSync(testImagePath)) {
    console.log(`📷 Reading image from: ${testImagePath}`);
    imageData = await readImageFile(testImagePath);
  } else {
    console.log("⚠️  No test image found. Creating a minimal sample JPEG...");

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
    console.log("✅ Sample image created\n");
  }

  // Validar tamaño mínimo (127 bytes)
  validateImageSize(imageData);
  console.log(
    `📊 Image size: ${imageData.length} bytes (${(
      imageData.length / 1024
    ).toFixed(2)} KB)\n`
  );

  // ============================================
  // STEP 5: Create StorageContext (reusing existing DataSet)
  // ============================================
  console.log(
    "📦 Step 5: Creating StorageContext (reusing existing DataSet)..."
  );
  console.log(`   ↪ Using existing DataSet ID: ${EXISTING_DATASET_ID}`);
  console.log(`   ↪ Using providerId: ${EXISTING_PROVIDER_ID}`);

  const context = await synapse.storage.createContext({
    dataSetId: EXISTING_DATASET_ID,
    providerId: EXISTING_PROVIDER_ID,
    // withCDN se respeta según cómo se creó el DataSet original; no lo tocamos acá
  });

  console.log("   📦 Context DataSet ID:", context.dataSetId);
  console.log("   📡 Service provider:", context.serviceProvider, "\n");

  // ============================================
  // STEP 6: Upload Image using StorageContext
  // ============================================
  console.log("📤 Step 6: Uploading image via StorageContext...");
  console.log(
    "   (StorageContext will use the existing dataset/provider under the hood...)"
  );

  const uploadResult = await context.upload(imageData);
  const pieceCid = uploadResult.pieceCid;
  const size = uploadResult.size;

  console.log("✅ Upload complete!");
  console.log(`   📋 PieceCID: ${pieceCid}`);
  console.log(
    `   📊 Reported size: ${size} bytes (${(size / 1024).toFixed(2)} KB)\n`
  );

  // ============================================
  // STEP 7: Piece Status (where is my data?)
  // ============================================
  console.log("🔍 Step 7: Checking piece status via StorageContext...");

  try {
    // En algunas versiones el tipo TS puede no tener los campos exactos,
    // pero en runtime existen. Si TS se queja, podés usar @ts-ignore.
    // @ts-ignore
    const status = await context.pieceStatus(pieceCid);

    console.log("   🧩 Piece exists on this provider? :", status.exists);
    // @ts-ignore
    console.log("   🌐 Retrieval URL:", status.retrievalUrl);
    // @ts-ignore
    console.log("   ⏱️ Last proven at:", status.lastProvenAt);
    // @ts-ignore
    console.log("   ⏭️ Next proof due:", status.nextProofDueAt, "\n");
  } catch (err: any) {
    console.log("   ⚠️ Could not fetch piece status:", err.message, "\n");
  }

  // ============================================
  // STEP 8: Download Image via StorageContext
  // ============================================
  console.log("📥 Step 8: Downloading image from Filecoin...");
  console.log(`   🔍 Using PieceCID: ${pieceCid}`);
  console.log(
    "   (StorageContext will use the same dataset/provider to download...)"
  );

  const downloadedData = await context.download(pieceCid);

  console.log("✅ Download complete!");
  console.log(
    `   📊 Downloaded size: ${downloadedData.length} bytes (${(
      downloadedData.length / 1024
    ).toFixed(2)} KB)\n`
  );

  // Verificación básica de integridad
  if (downloadedData.length !== imageData.length) {
    console.warn(
      "⚠️  Warning: Downloaded size doesn't match original size (puede ser normal en algunos casos, pero revisalo)."
    );
  } else {
    console.log("✅ Data integrity check: sizes match!\n");
  }

  // ============================================
  // STEP 9: Save Downloaded Image
  // ============================================
  console.log("💾 Step 9: Saving downloaded image to disk...");

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputFilename = `downloaded-${timestamp}.jpg`;

  await saveImageFile(downloadedData, outputFilename);

  console.log("\n" + "=".repeat(60));
  console.log("🎉 SUCCESS! Image storage and retrieval test completed!");
  console.log("=".repeat(60));
  console.log("\n📝 Summary:");
  console.log(`   • Image uploaded via StorageContext.upload`);
  console.log(`   • PieceCID: ${pieceCid}`);
  console.log(`   • Original size: ${imageData.length} bytes`);
  console.log(`   • Reported size: ${size} bytes`);
  console.log(`   • Image downloaded via StorageContext.download`);
  console.log(`   • Saved as: ${outputFilename}`);
  console.log(
    "   • Your image is now stored on Filecoin's decentralized Warm Storage (reusing DataSet)!\n"
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
    if ((error as any).details) {
      console.error("   Details:", (error as any).details);
    }
    if (error.cause) {
      console.error("   Cause:", error.cause);
    }
    if (error.stack) {
      console.error("\n   Stack trace:");
      console.error(error.stack);
    }
    process.exit(1);
  });
