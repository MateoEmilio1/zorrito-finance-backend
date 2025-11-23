// src/test-dataset-piece-metadata.ts
import { Synapse, RPC_URLS, WarmStorageService } from "@filoz/synapse-sdk";
import { config } from "dotenv";

config();

const APP_ID = "zorrito.finance"; // 👈 ahora usamos el appId nuevo

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

  // 🔎 Filtrar data sets nuevos de Zorrito por metadata.appId
  const zorritoDataSets = dataSets.filter(
    (ds: any) => ds.metadata && ds.metadata.appId === APP_ID
  );

  let targetDataSet: any;

  if (zorritoDataSets.length > 0) {
    targetDataSet = zorritoDataSets[zorritoDataSets.length - 1];
    console.log(
      `✅ Found ${zorritoDataSets.length} Zorrito data sets (appId=${APP_ID}). Using the last one.`
    );
  } else {
    console.log(
      "⚠️ No Zorrito data sets with appId=zorrito.finance. Showing the last data set as fallback:"
    );
    targetDataSet = dataSets[dataSets.length - 1];
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

    // Si es nuestro nuevo esquema:
    if (metadata && metadata.type === "fox_profile") {
      console.log("   🦊 fox_profile:", {
        foxId: metadata.foxId,
        foxName: metadata.foxName,
        owner: metadata.owner,
        bornDate: metadata.bornDate,
      });
    }

    if (metadata && metadata.type === "feed_event") {
      console.log("   🥕 feed_event:", {
        foxId: metadata.foxId,
        owner: metadata.owner,
        fedAt: metadata.fedAt,
        round: metadata.round,
        creditsDelta: metadata.creditsDelta,
      });
    }
  }

  console.log("\n✅ Finished inspecting piece metadata");
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
