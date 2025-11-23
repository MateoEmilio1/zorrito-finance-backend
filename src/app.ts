// src/app.ts
import express from "express";
import cors from "cors";
import foxRouter from "./routes/foxRoutes";

const app = express();

const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 🔥 IMPORTANTE: eliminar esta línea que rompe con path-to-regexp
// app.options("*", cors());

// (si quisieras, podrías hacerla específica)
// app.options("/api/fox", cors());

app.use(express.json({ limit: "10mb" }));
app.use("/api/fox", foxRouter);

export default app;
