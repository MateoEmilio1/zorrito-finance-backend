import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Read an image file and convert it to Uint8Array for upload
 */
export async function readImageFile(imagePath: string): Promise<Uint8Array> {
  if (!existsSync(imagePath)) {
    throw new Error(`Image file not found: ${imagePath}`);
  }
  
  const buffer = await readFile(imagePath);
  return new Uint8Array(buffer);
}

/**
 * Save downloaded image data to a file
 */
export async function saveImageFile(
  data: Uint8Array,
  outputPath: string
): Promise<void> {
  const outputDir = join(process.cwd(), 'downloaded-images');
  
  // Create directory if it doesn't exist
  if (!existsSync(outputDir)) {
    const { mkdir } = await import('fs/promises');
    await mkdir(outputDir, { recursive: true });
  }
  
  const fullPath = join(outputDir, outputPath);
  await writeFile(fullPath, data);
  console.log(`✅ Image saved to: ${fullPath}`);
}

/**
 * Validate image file size (minimum 127 bytes as per Filecoin requirements)
 */
export function validateImageSize(data: Uint8Array): void {
  if (data.length < 127) {
    throw new Error(
      `Image is too small (${data.length} bytes). Minimum size is 127 bytes.`
    );
  }
  
  console.log(`📊 Image size: ${data.length} bytes (${(data.length / 1024).toFixed(2)} KB)`);
}

