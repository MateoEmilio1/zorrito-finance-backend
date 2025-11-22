// src/app.ts
import express from "express";
import foxRouter from "./routes/foxRoutes";

const app = express();

// Para recibir JSON grande (base64 de imágenes)
app.use(express.json({ limit: "10mb" }));

// Rutas de zorrito
app.use("/api/fox", foxRouter);

export default app;
