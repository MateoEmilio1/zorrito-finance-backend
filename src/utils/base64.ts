// src/utils/base64.ts
import { Buffer } from "buffer";

/**
 * Recibe algo como:
 *  data:image/png;base64,iVBORw0K...
 * y devuelve:
 *  - mimeType: "image/png"
 *  - buffer: Uint8Array con los bytes de la imagen
 */
export function parseDataUrlToUint8Array(dataUrl: string): {
  mimeType: string;
  buffer: Uint8Array;
} {
  const match = dataUrl.match(/^data:(.+);base64,(.*)$/);

  if (!match) {
    throw new Error("Invalid data URL format");
  }

  const mimeType = match[1];
  const base64Data = match[2];

  const buf = Buffer.from(base64Data, "base64");
  return {
    mimeType,
    buffer: new Uint8Array(buf),
  };
}
