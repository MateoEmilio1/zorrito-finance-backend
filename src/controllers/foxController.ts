// src/controllers/foxController.ts
import { Request, Response } from "express";
import {
  uploadFoxProfile,
  uploadFeedEvent,
  inspectPiecesForSeason,
  listFoxesForSeason,
  getFoxForSeason,
} from "../filecoin/zorritoStorageService.js";
import { getSynapse } from "../filecoin/synapseClient.js";
import { parseDataUrlToUint8Array } from "../utils/base64.js";
import { validateImageSize } from "../utils/image-helpers.js";

// helper para round/season actual (YYYY-MM)
function getCurrentRound(): string {
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

// 🔧 helper para armar el URL de la imagen con la address del owner en minúsculas
function buildImageUrl(owner: string, pieceCid: string): string {
  const ownerLower = owner.toLowerCase(); // MINIMIZADA la address
  return `https://${ownerLower}.calibration.filbeam.io/${pieceCid}`;
}

// 🔧 helper para resolver owner (reutilizado en createFox y feedFox)
//    ⚠️ TIP de performance: si el frontend SIEMPRE manda owner, casi nunca vas a pegarle al RPC.
async function resolveOwner(ownerFromBody?: string): Promise<string> {
  if (ownerFromBody) return ownerFromBody;

  const synapse = await getSynapse(); // idealmente getSynapse cachea internamente
  return synapse.getSigner().getAddress();
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

    // 1) resolver owner y round
    const [owner, round] = await Promise.all([
      resolveOwner(ownerFromBody),
      Promise.resolve(getCurrentRound()),
    ]);

    const shortOwner = owner.slice(2, 8);
    const foxId = `fox-${shortOwner}-${Date.now().toString(16)}`;

    // 2) dataURL -> bytes
    const { buffer } = parseDataUrlToUint8Array(imageDataUrl);

    // 3) validar tamaño mínimo
    validateImageSize(buffer);

    // 4) subir imagen + metadata como fox_profile a Filecoin
    const uploadRes = await uploadFoxProfile({
      foxId,
      foxName: name,
      owner,
      round,
      imageData: buffer,
    });

    const pieceCid: string = pieceCidToString(uploadRes.pieceCid);

    // URL correcta: owner en minúsculas como subdominio
    const imageUrl = buildImageUrl(owner, pieceCid);

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

    const [owner, round] = await Promise.all([
      resolveOwner(ownerFromBody),
      Promise.resolve(getCurrentRound()),
    ]);

    const delta = typeof creditsDelta === "number" ? creditsDelta : -1;

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
