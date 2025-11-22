/**
 * Script para obtener USDFC del faucet de Filecoin Calibration
 *
 * Este script intenta obtener USDFC tokens del faucet automáticamente
 * y verifica el balance en la wallet.
 */

import { ethers } from "ethers";
import { config } from "dotenv";
import { Synapse, RPC_URLS, TOKENS } from "@filoz/synapse-sdk";

config();

const WALLET_ADDRESS = "0xAF48DdBDea966694a06fb979b11618D71EdbE814";

/**
 * Intenta obtener USDFC del faucet usando la API si está disponible
 */
async function requestUSDFCFromFaucet() {
  console.log("🚰 Intentando obtener USDFC del faucet...\n");
  console.log(`📍 Wallet Address: ${WALLET_ADDRESS}\n`);

  // URL del faucet según la documentación
  const faucetURL =
    "https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc";

  try {
    // Intentar hacer una petición POST al faucet (si tiene API)
    const response = await fetch(faucetURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: WALLET_ADDRESS,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Solicitud enviada al faucet");
      console.log("📋 Respuesta:", data);
      return true;
    } else {
      console.log("⚠️  El faucet no tiene API automática disponible");
      console.log("📝 Necesitas solicitarlo manualmente");
      return false;
    }
  } catch (error: any) {
    console.log("⚠️  No se pudo conectar al faucet automáticamente");
    console.log(
      "📝 Esto es normal - la mayoría de faucets requieren interacción manual\n"
    );
    return false;
  }
}

/**
 * Verifica el balance de USDFC en la wallet
 */
async function checkUSDFCBalance() {
  console.log("💰 Verificando balance de USDFC...\n");

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY no encontrado en .env");
  }

  const rpcURL = process.env.RPC_URL || RPC_URLS.calibration.http;

  try {
    const synapse = await Synapse.create({
      privateKey: privateKey,
      rpcURL: rpcURL,
    });

    const balance = await synapse.payments.walletBalance(TOKENS.USDFC);
    const formattedBalance = ethers.formatUnits(balance, 18);

    console.log(`💵 Balance de USDFC: ${formattedBalance} USDFC\n`);

    if (balance > 0n) {
      console.log("✅ ¡Ya tienes USDFC en tu wallet!");
      return true;
    } else {
      console.log("❌ No tienes USDFC todavía");
      return false;
    }
  } catch (error: any) {
    console.log("⚠️  Error al verificar balance:", error.message);
    console.log("   Esto puede ser normal si el RPC está teniendo problemas\n");
    return false;
  }
}

/**
 * Función principal
 */
async function main() {
  console.log("=".repeat(60));
  console.log("🪙 Script para Obtener USDFC Tokens");
  console.log("=".repeat(60));
  console.log();

  // Verificar balance actual
  const hasBalance = await checkUSDFCBalance();

  if (hasBalance) {
    console.log("🎉 Ya tienes USDFC. No necesitas obtener más.");
    return;
  }

  console.log("\n" + "=".repeat(60));
  console.log("📋 Instrucciones para Obtener USDFC Manualmente");
  console.log("=".repeat(60));
  console.log();
  console.log("1. Abre este link en tu navegador:");
  console.log("   https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc");
  console.log();
  console.log("2. Pega tu dirección de wallet:");
  console.log(`   ${WALLET_ADDRESS}`);
  console.log();
  console.log("3. Haz clic en el botón para solicitar tokens");
  console.log();
  console.log("4. Espera unos minutos para recibir los tokens");
  console.log();
  console.log("5. Ejecuta este script de nuevo para verificar:");
  console.log("   npm run get-usdfc");
  console.log();

  // Intentar obtener automáticamente (probablemente no funcione)
  const autoSuccess = await requestUSDFCFromFaucet();

  if (!autoSuccess) {
    console.log("\n" + "=".repeat(60));
    console.log("📝 Pasos Manuales:");
    console.log("=".repeat(60));
    console.log();
    console.log("El faucet requiere interacción manual.");
    console.log("Sigue estos pasos:");
    console.log();
    console.log(
      "1. Ve a: https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc"
    );
    console.log(`2. Ingresa: ${WALLET_ADDRESS}`);
    console.log("3. Solicita los tokens");
    console.log("4. Espera la confirmación");
    console.log();
    console.log("💡 Tip: Puedes verificar tu balance en:");
    console.log(`   https://calibration.filfox.info/address/${WALLET_ADDRESS}`);
    console.log();
  }
}

main()
  .then(() => {
    console.log("\n✅ Script completado");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  });
