// src/filecoin/filecoinTypes.ts

export const ZORRITO_APP_ID = "zorrito.finance" as const;
export type ZorritoAppId = typeof ZORRITO_APP_ID;

export interface DataSetMetadata {
  appId: ZorritoAppId;
  appUrl: string;
  env: string; // "dev" | "staging" | "prod"
  network: string; // "filecoin-calibration" | "filecoin-mainnet"...
  season: string; // ej: "2025-11"
  gameVersion: string;
}

export interface FoxProfileMetadata {
  type: "fox_profile";
  foxId: string;
  foxName: string;
  owner: string;
  bornDate: string; // ISO
  round: string; // igual que season, o más granular si querés
}

export interface FeedEventMetadata {
  type: "feed_event";
  foxId: string;
  owner: string;
  fedAt: string; // ISO
  round: string;
  creditsDelta: number;
}

export type PieceMetadata = FoxProfileMetadata | FeedEventMetadata;
