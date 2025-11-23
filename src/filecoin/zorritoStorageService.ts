// src/filecoin/zorritoStorageService.ts
import { WarmStorageService } from "@filoz/synapse-sdk";
import { getSynapse } from "./synapseClient.js";
import {
  DataSetMetadata,
  FoxProfileMetadata,
  FeedEventMetadata,
  PieceMetadata,
  ZORRITO_APP_ID,
} from "./filecoinTypes.js";

/**
 * Construye el metadata tipado de un DataSet de zorrito.finance.
 */
function buildDataSetMetadata(season: string): DataSetMetadata {
  return {
    appId: ZORRITO_APP_ID,
    appUrl: "https://zorrito.vercel.app",
    env: process.env.NODE_ENV || "dev",
    network: "filecoin-calibration",
    season,
    gameVersion: "1.0.0",
  };
}

/**
 * Convierte nuestro DataSetMetadata tipado al formato que espera el SDK (Record<string, string>).
 */
function toSdkMetadata(meta: DataSetMetadata): Record<string, string> {
  return {
    appId: meta.appId,
    appUrl: meta.appUrl,
    env: meta.env,
    network: meta.network,
    season: meta.season,
    gameVersion: meta.gameVersion,
  };
}

/**
 * Convierte metadata crudo del SDK (Record<string, string>) a nuestro DataSetMetadata tipado.
 * Ojo: asumimos que los campos existen porque los seteamos nosotros.
 */
function fromSdkMetadata(raw: Record<string, string>): DataSetMetadata {
  return {
    appId: raw.appId as typeof ZORRITO_APP_ID,
    appUrl: raw.appUrl,
    env: raw.env,
    network: raw.network,
    season: raw.season,
    gameVersion: raw.gameVersion,
  };
}

/**
 * Convierte piece metadata tipado (FoxProfile / FeedEvent) al formato del SDK (Record<string, string>).
 */
function toPieceSdkMetadata(meta: PieceMetadata): Record<string, string> {
  if (meta.type === "fox_profile") {
    const m: FoxProfileMetadata = meta;
    return {
      type: m.type,
      foxId: m.foxId,
      foxName: m.foxName,
      owner: m.owner,
      bornDate: m.bornDate,
    };
  }

  // feed_event
  const m: FeedEventMetadata = meta;
  return {
    type: m.type,
    foxId: m.foxId,
    owner: m.owner,
    fedAt: m.fedAt,
    round: m.round,
  };
}

/**
 * Crea (o reutiliza) un DataSet para una season y devuelve el StorageContext.
 */
export async function createStorageContextForSeason(season: string) {
  const synapse = await getSynapse();
  const metadata = buildDataSetMetadata(season);

  const storageContext = await synapse.storage.createContext({
    metadata: toSdkMetadata(metadata),
    withCDN: true,
  });

  return {
    synapse,
    storageContext,
    dataSetId: storageContext.dataSetId,
    dataSetMetadata: fromSdkMetadata(
      storageContext.dataSetMetadata as Record<string, string>
    ),
  };
}

/**
 * Sube el perfil inicial de un zorrito (fox_profile).
 * En el flujo real, esto se llamaría cuando el usuario crea su zorrito.
 */
export async function uploadFoxProfile(params: {
  foxId: string;
  foxName: string;
  owner: string;
  round: string; // e.g. "2025-11"
  imageData: Uint8Array; // avatar o imagen base
}) {
  const { storageContext, dataSetId, dataSetMetadata } =
    await createStorageContextForSeason(params.round);

  const metadata: FoxProfileMetadata = {
    type: "fox_profile",
    foxId: params.foxId,
    foxName: params.foxName,
    owner: params.owner,
    bornDate: new Date().toISOString(),
    round: params.round,
  };

  const uploadResult = await storageContext.upload(params.imageData, {
    metadata: toPieceSdkMetadata(metadata),
  });

  return {
    ...uploadResult,
    dataSetId,
    dataSetMetadata,
    pieceMetadata: metadata,
  };
}

/**
 * Crea un evento de alimentación (feed_event).
 * Podés llamarlo cada vez que el usuario alimenta al zorrito.
 */
export async function uploadFeedEvent(params: {
  foxId: string;
  owner: string;
  round: string;
  creditsDelta: number; // ej: -1 si consumió 1 crédito
}) {
  const { storageContext, dataSetId, dataSetMetadata } =
    await createStorageContextForSeason(params.round);

  const metadata: FeedEventMetadata = {
    type: "feed_event",
    foxId: params.foxId,
    owner: params.owner,
    fedAt: new Date().toISOString(),
    round: params.round,
    creditsDelta: params.creditsDelta,
  };

  const dummyData = new Uint8Array([1]);

  const uploadResult = await storageContext.upload(dummyData, {
    metadata: toPieceSdkMetadata(metadata),
  });

  return {
    ...uploadResult,
    dataSetId,
    dataSetMetadata,
    pieceMetadata: metadata,
  };
}

/**
 * Devuelve los data sets de zorrito.finance para esta cuenta.
 */
export async function listZorritoDataSets() {
  const synapse = await getSynapse();
  const dataSets = await synapse.storage.findDataSets();

  const zorritoDataSets = dataSets.filter(
    (ds: any) => ds.metadata && ds.metadata.appId === ZORRITO_APP_ID
  );

  // Normalizamos metadata a nuestro tipo fuerte
  return zorritoDataSets.map((ds: any) => ({
    pdpVerifierDataSetId: ds.pdpVerifierDataSetId as number,
    metadata: fromSdkMetadata(ds.metadata as Record<string, string>),
  }));
}

/**
 * Inspecciona pieces + metadata para una season dada.
 * Esto es como tu test-dataset-piece-metadata.ts, pero como servicio.
 */
export async function inspectPiecesForSeason(season: string) {
  const synapse = await getSynapse();
  const dataSets = await synapse.storage.findDataSets();

  const zorritoDataSets = dataSets.filter(
    (ds: any) =>
      ds.metadata &&
      ds.metadata.appId === ZORRITO_APP_ID &&
      ds.metadata.season === season
  );

  if (zorritoDataSets.length === 0) {
    return {
      found: false,
      message: `No data sets for zorrito.finance in season ${season}`,
    };
  }

  const targetDataSet = zorritoDataSets[zorritoDataSets.length - 1];
  const dataSetId = targetDataSet.pdpVerifierDataSetId as number;

  const context = await synapse.storage.createContext({
    dataSetId,
    withCDN: true,
  });

  const pieces: { pieceCid: any; pieceId: number }[] = [];
  for await (const piece of context.getPieces()) {
    pieces.push(piece);
  }

  if (pieces.length === 0) {
    return {
      found: true,
      dataSetId,
      dataSetMetadata: fromSdkMetadata(
        targetDataSet.metadata as Record<string, string>
      ),
      pieces: [],
    };
  }

  const warmStorage = await WarmStorageService.create(
    synapse.getProvider(),
    synapse.getWarmStorageAddress()
  );

  const piecesWithMetadata: Array<{
    pieceId: number;
    pieceCid: string;
    metadata: PieceMetadata | Record<string, any>;
  }> = [];

  for (const piece of pieces) {
    const metadata = await warmStorage.getPieceMetadata(
      dataSetId,
      piece.pieceId
    );

    piecesWithMetadata.push({
      pieceId: piece.pieceId,
      pieceCid: piece.pieceCid.toString?.() ?? String(piece.pieceCid),
      metadata,
    });
  }

  return {
    found: true,
    dataSetId,
    dataSetMetadata: fromSdkMetadata(
      targetDataSet.metadata as Record<string, string>
    ),
    pieces: piecesWithMetadata,
  };
}

// 👇 helpers para explotar mejor inspectPiecesForSeason

export async function listFoxesForSeason(season: string) {
  const result = await inspectPiecesForSeason(season);

  if (!result.found || !result.pieces) {
    return [];
  }

  return result.pieces
    .filter((p) => p.metadata?.type === "fox_profile")
    .map((p) => {
      const m = p.metadata as FoxProfileMetadata;
      return {
        foxId: m.foxId,
        foxName: m.foxName,
        owner: m.owner,
        bornDate: m.bornDate,
        season,
        dataSetId: result.dataSetId,
        pieceCid: p.pieceCid,
        imageUrl: `https://calib.ezpdpz.net/piece/${p.pieceCid}`,
      };
    });
}

export async function getFoxForSeason(foxId: string, season: string) {
  const result = await inspectPiecesForSeason(season);

  if (!result.found || !result.pieces) {
    return null;
  }

  const related = result.pieces.filter((p) => p.metadata?.foxId === foxId);

  if (related.length === 0) {
    return null;
  }

  const profilePiece = related.find((p) => p.metadata?.type === "fox_profile");

  if (!profilePiece) {
    return null;
  }

  const profileMeta = profilePiece.metadata as FoxProfileMetadata;

  const feedEvents = related
    .filter((p) => p.metadata?.type === "feed_event")
    .map((p) => {
      const m = p.metadata as FeedEventMetadata;
      return {
        fedAt: m.fedAt,
        creditsDelta: m.creditsDelta,
        pieceCid: p.pieceCid,
      };
    })
    // ordenar por fecha
    .sort((a, b) => a.fedAt.localeCompare(b.fedAt));

  const lastFeed =
    feedEvents.length > 0 ? feedEvents[feedEvents.length - 1].fedAt : null;

  const totalCreditsDelta = feedEvents.reduce(
    (acc, ev) => acc + (ev.creditsDelta ?? 0),
    0
  );

  return {
    foxId: profileMeta.foxId,
    foxName: profileMeta.foxName,
    owner: profileMeta.owner,
    bornDate: profileMeta.bornDate,
    season,
    dataSetId: result.dataSetId,
    pieceCid: profilePiece.pieceCid,
    imageUrl: `https://calib.ezpdpz.net/piece/${profilePiece.pieceCid}`,
    stats: {
      feedsCount: feedEvents.length,
      lastFeed,
      totalCreditsDelta,
    },
    feedEvents,
  };
}
