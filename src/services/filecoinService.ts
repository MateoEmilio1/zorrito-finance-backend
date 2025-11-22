import { Synapse, RPC_URLS } from "@filoz/synapse-sdk";
import {
  FoxProfileMetadata,
  FeedEventMetadata,
} from "../filecoin/filecoinTypes.js";

let synapsePromise: Promise<any> | null = null;

async function getSynapse() {
  if (!synapsePromise) {
    const privateKey = process.env.PRIVATE_KEY!;
    const rpcURL = process.env.RPC_URL || RPC_URLS.calibration.http;

    synapsePromise = Synapse.create({
      privateKey,
      rpcURL,
      withCDN: true,
    });
  }
  return synapsePromise;
}

export async function createFoxProfilePiece(params: {
  foxId: string;
  foxName: string;
  owner: string;
  round: string;
  imageData: Uint8Array;
}) {
  const synapse = await getSynapse();

  const storageContext = await synapse.storage.createContext({
    metadata: {
      appId: "zorrito.finance",
      appUrl: "https://zorrito.vercel.app",
      env: process.env.NODE_ENV ?? "dev",
      network: "filecoin-calibration",
      season: params.round,
      gameVersion: "1.0.0",
    },
    withCDN: true,
  });

  const metadata: FoxProfileMetadata = {
    type: "fox_profile",
    foxId: params.foxId,
    foxName: params.foxName,
    owner: params.owner,
    bornDate: new Date().toISOString(),
    round: params.round,
  };

  return storageContext.upload(params.imageData, { metadata });
}

export async function createFeedEventPiece(params: {
  foxId: string;
  owner: string;
  round: string;
  creditsDelta: number;
}) {
  const synapse = await getSynapse();

  // podrías reusar un dataSetId ya creado por foxId+round,
  // pero para hackathon con un solo data set por season alcanza.
  const storageContext = await synapse.storage.createContext({
    metadata: {
      appId: "zorrito.finance",
      appUrl: "https://zorrito.vercel.app",
      env: process.env.NODE_ENV ?? "dev",
      network: "filecoin-calibration",
      season: params.round,
      gameVersion: "1.0.0",
    },
    withCDN: true,
  });

  const metadata: FeedEventMetadata = {
    type: "feed_event",
    foxId: params.foxId,
    owner: params.owner,
    fedAt: new Date().toISOString(),
    round: params.round,
    creditsDelta: params.creditsDelta,
  };

  return storageContext.upload(new Uint8Array([1]), { metadata }); // dato mínimo; después podés usar imagen/log real
}
