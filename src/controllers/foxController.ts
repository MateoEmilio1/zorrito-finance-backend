// src/controllers/foxController.ts
import { Request, Response } from "express";
import {
  uploadFoxProfile,
  uploadFeedEvent,
  inspectPiecesForSeason,
  listFoxesForSeason,
  getFoxForSeason,
} from "../filecoin/zorritoStorageService";
import { getSynapse } from "../filecoin/synapseClient";
import { parseDataUrlToUint8Array } from "../utils/base64";
import { validateImageSize } from "../utils/image-helpers.js";

// helper para round/season actual (YYYY-MM)
function getCurrentRound() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// 🔧 helper para castear PieceLink/lo-que-sea a string sin que TS se queje
function pieceCidToString(pieceCid: unknown): string {
  if (pieceCid && typeof (pieceCid as any).toString === "function") {
    return (pieceCid as any).toString();
  }
  return String(pieceCid);
}

// GET /api/fox?season=YYYY-MM  -> lista de zorritos
export async function listFoxes(req: Request, res: Response) {
  try {
    const season =
      (req.query.season as string | undefined) || getCurrentRound();

    const foxes = await listFoxesForSeason(season);

    return res.json({
      season,
      foxes,
    });
  } catch (error: any) {
    console.error("❌ Error in listFoxes:", error);
    return res.status(500).json({ error: error.message || "Internal error" });
  }
}

// GET /api/fox/:foxId?season=YYYY-MM  -> detalle de un zorrito
export async function getFox(req: Request, res: Response) {
  try {
    const { foxId } = req.params;
    const season =
      (req.query.season as string | undefined) || getCurrentRound();

    if (!foxId) {
      return res.status(400).json({ error: "foxId is required" });
    }

    const fox = await getFoxForSeason(foxId, season);

    if (!fox) {
      return res.status(404).json({ error: "Fox not found" });
    }

    return res.json(fox);
  } catch (error: any) {
    console.error("❌ Error in getFox:", error);
    return res.status(500).json({ error: error.message || "Internal error" });
  }
}

// POST /api/fox
// body: { name: string; imageDataUrl: string; owner?: string }
export async function createFox(req: Request, res: Response) {
  try {
    const {
      name,
      imageDataUrl,
      owner: ownerFromBody,
    } = req.body as {
      name?: string;
      imageDataUrl?: string;
      owner?: string;
    };

    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }

    if (!imageDataUrl) {
      return res.status(400).json({
        error: "imageDataUrl (data:image/...;base64,...) is required",
      });
    }

    // owner: si no viene en el body, usamos el signer del backend
    let owner = ownerFromBody;
    if (!owner) {
      const synapse = await getSynapse();
      owner = await synapse.getSigner().getAddress();
    }

    const round = getCurrentRound();
    const shortOwner = owner.slice(2, 8);
    const foxId = `fox-${shortOwner}-${Date.now().toString(16)}`;

    // 1) dataURL -> bytes
    const { buffer } = parseDataUrlToUint8Array(imageDataUrl);

    // 2) validar tamaño mínimo
    validateImageSize(buffer);

    // 3) subir imagen + metadata como fox_profile a Filecoin
    const uploadRes = await uploadFoxProfile({
      foxId,
      foxName: name,
      owner,
      round,
      imageData: buffer,
    });

    const pieceCid: string = pieceCidToString(uploadRes.pieceCid);
    const imageUrl = `https://calib.ezpdpz.net/piece/${pieceCid}`;

    return res.status(201).json({
      foxId,
      name,
      owner,
      round,
      imageUrl,
      pieceCid,
      storage: {
        dataSetId: uploadRes.dataSetId,
        dataSetMetadata: uploadRes.dataSetMetadata,
        pieceCid,
        pieceMetadata: uploadRes.pieceMetadata,
      },
    });
  } catch (error: any) {
    console.error("❌ Error in createFox:", error);
    return res.status(500).json({
      error: error.message || "Internal error",
    });
  }
}

// POST /api/fox/:foxId/feed
// body: { owner?: string, creditsDelta?: number }
export async function feedFox(req: Request, res: Response) {
  try {
    const { foxId } = req.params;
    const { owner: ownerFromBody, creditsDelta } = req.body as {
      owner?: string;
      creditsDelta?: number;
    };

    if (!foxId) {
      return res.status(400).json({ error: "foxId is required" });
    }

    let owner = ownerFromBody;
    if (!owner) {
      const synapse = await getSynapse();
      owner = await synapse.getSigner().getAddress();
    }

    const delta = typeof creditsDelta === "number" ? creditsDelta : -1;
    const round = getCurrentRound();

    const uploadRes = await uploadFeedEvent({
      foxId,
      owner,
      round,
      creditsDelta: delta,
    });

    const pieceCid: string = pieceCidToString(uploadRes.pieceCid);

    return res.status(201).json({
      foxId,
      owner,
      round,
      creditsDelta: delta,
      storage: {
        dataSetId: uploadRes.dataSetId,
        pieceCid,
        pieceMetadata: uploadRes.pieceMetadata,
      },
    });
  } catch (error: any) {
    console.error("❌ Error in feedFox:", error);
    return res.status(500).json({ error: error.message || "Internal error" });
  }
}

// GET /api/fox/season/:season  (debug admin)
export async function getSeasonPieces(req: Request, res: Response) {
  try {
    const { season } = req.params;

    const result = await inspectPiecesForSeason(season);

    return res.json(result);
  } catch (error: any) {
    console.error("❌ Error in getSeasonPieces:", error);
    return res.status(500).json({ error: error.message || "Internal error" });
  }
}
