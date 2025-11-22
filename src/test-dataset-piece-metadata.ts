// src/test-dataset-piece-metadata.ts
import { Synapse, RPC_URLS, WarmStorageService } from "@filoz/synapse-sdk";
import { config } from "dotenv";

config();

const APP_KEY = "zorrito.com";

async function main() {
  console.log("🔍 Inspecting data set pieces + metadata (zorrito)\n");

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY missing in .env");
  }

  const rpcURL = process.env.RPC_URL || RPC_URLS.calibration.http;
  const synapse = await Synapse.create({ privateKey, rpcURL });

  const address = await synapse.getSigner().getAddress();
  console.log("👛 Wallet:", address);

  // 1) Traer todos los data sets de esta cuenta
  const dataSets = await synapse.storage.findDataSets();

  console.log(`📦 Total data sets for this account: ${dataSets.length}`);

  if (dataSets.length === 0) {
    console.log("⚠️ No data sets found for this account yet.");
    return;
  }

  // Filtrar data sets de Zorrito por metadata.app
  const zorritoDataSets = dataSets.filter(
    (ds: any) => ds.metadata && ds.metadata.app === APP_KEY
  );

  let targetDataSet: any;

  if (zorritoDataSets.length > 0) {
    targetDataSet = zorritoDataSets[zorritoDataSets.length - 1];
    console.log(
      `✅ Found ${zorritoDataSets.length} Zorrito data sets. Using the last one.`
    );
  } else {
    targetDataSet = dataSets[dataSets.length - 1];
    console.log(
      "⚠️ No Zorrito-specific data set found (metadata.app). Using the last data set as fallback."
    );
  }

  const dataSetId = targetDataSet.pdpVerifierDataSetId;

  console.log("\n📦 Using dataSetId:", dataSetId);
  console.log("   🏷 Data set metadata:", targetDataSet.metadata);

  // 2) Crear un contexto de storage para ese data set
  const context = await synapse.storage.createContext({
    dataSetId,
    withCDN: true,
  });

  // 3) Listar todas las pieces de ese data set
  const pieces: { pieceCid: any; pieceId: number }[] = [];
  for await (const piece of context.getPieces()) {
    pieces.push(piece);
  }

  console.log(`\n🧩 Found ${pieces.length} pieces in this data set\n`);
  if (pieces.length === 0) {
    console.log("⚠️ No pieces in this data set yet.");
    return;
  }

  // 4) Crear WarmStorageService para leer metadata de cada piece
  const warmStorage = await WarmStorageService.create(
    synapse.getProvider(),
    synapse.getWarmStorageAddress()
  );

  // 5) Leer metadata de cada piece
  for (const piece of pieces) {
    const metadata = await warmStorage.getPieceMetadata(
      dataSetId,
      piece.pieceId
    );

    console.log("──────────────────────────────");
    console.log("PieceId:", piece.pieceId);
    console.log("PieceCID:", piece.pieceCid.toString?.() ?? piece.pieceCid);
    console.log("Metadata:", metadata);
    if (metadata && metadata.zorritoName) {
      console.log("   🦊 zorritoName:", metadata.zorritoName);
    }
  }

  console.log("\n✅ Finished inspecting piece metadata");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
