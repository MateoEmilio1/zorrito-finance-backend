/**
 * Test de Descarga - Descarga una imagen usando un PieceCID
 *
 * Útil para verificar que puedes descargar datos que ya subiste antes
 */

import { Synapse, RPC_URLS } from "@filoz/synapse-sdk";
import { config } from "dotenv";
import { saveImageFile } from "./utils/image-helpers.js";
import { createHash } from "crypto";

config();

/**
 * Descarga una imagen usando su PieceCID
 */
async function downloadByPieceCID(pieceCID: string) {
  console.log("=".repeat(70));
  console.log("📥 TEST DE DESCARGA POR PIECECID");
  console.log("=".repeat(70));
  console.log();

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY no encontrado en .env");
  }

  const rpcURL = process.env.RPC_URL || RPC_URLS.calibration.http;
  const synapse = await Synapse.create({
    privateKey: privateKey,
    rpcURL: rpcURL,
  });

  console.log(`🔍 Descargando PieceCID: ${pieceCID}`);
  console.log();

  const start = Date.now();
  const data = await synapse.download(pieceCID);
  const time = Date.now() - start;

  const hash = createHash("sha256").update(data).digest("hex");

  console.log("✅ Descarga exitosa!");
  console.log(`   📊 Tamaño: ${data.length} bytes`);
  console.log(`   ⏱️  Tiempo: ${time}ms`);
  console.log(`   🔐 Hash SHA256: ${hash.substring(0, 32)}...`);
  console.log();

  // Guardar imagen
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `downloaded-${pieceCID.substring(0, 16)}-${timestamp}.jpg`;
  await saveImageFile(data, filename);

  console.log(`💾 Imagen guardada: downloaded-images/${filename}`);
  console.log();
  console.log("✅ Test de descarga completado!");
}

// Obtener PieceCID de argumentos o usar uno de ejemplo
const pieceCID = process.argv[2];

if (!pieceCID) {
  console.error("❌ Error: Debes proporcionar un PieceCID");
  console.error();
  console.error("Uso:");
  console.error("  npm run test:download <PIECECID>");
  console.error();
  console.error("Ejemplo:");
  console.error("  npm run test:download baga6ea4seaq...");
  process.exit(1);
}

downloadByPieceCID(pieceCID)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error.message);
    if (error.stack) {
      console.error("\nStack trace:");
      console.error(error.stack);
    }
    process.exit(1);
  });
