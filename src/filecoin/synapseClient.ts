// src/filecoin/synapseClient.ts
import { Synapse, RPC_URLS } from "@filoz/synapse-sdk";
import { config } from "dotenv";

config();

type SynapseClient = Awaited<ReturnType<typeof Synapse.create>>;

let synapsePromise: Promise<SynapseClient> | null = null;

export async function getSynapse(): Promise<SynapseClient> {
  if (!synapsePromise) {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("❌ PRIVATE_KEY missing in .env");
    }

    const rpcURL = process.env.RPC_URL || RPC_URLS.calibration.http;

    synapsePromise = Synapse.create({
      privateKey,
      rpcURL,
      withCDN: true,
    });
  }

  return synapsePromise;
}
