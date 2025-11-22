// src/routes/foxRoutes.ts
import { Router } from "express";
import {
  listFoxes,
  getFox,
  createFox,
  feedFox,
  getSeasonPieces,
} from "../controllers/foxController";

const router = Router();

// Lista de zorritos (season actual o ?season=YYYY-MM)
router.get("/", listFoxes);

// Detalle de un zorrito
router.get("/:foxId", getFox);

// Crear zorrito
router.post("/", createFox);

// Alimentar zorrito
router.post("/:foxId/feed", feedFox);

// Debug/admin: ver pieces crudos por season
router.get("/season/:season", getSeasonPieces);

export default router;
