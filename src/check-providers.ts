/**
 * Script para verificar el estado de los proveedores de Filecoin
 *
 * Este script verifica:
 * - Qué proveedores están disponibles
 * - El estado de cada proveedor (ping test)
 * - URLs de los servicios
 * - Información detallada de cada proveedor
 */

import { Synapse, RPC_URLS } from "@filoz/synapse-sdk";
import { config } from "dotenv";
import { writeFile } from "fs/promises";
import { join } from "path";

config();

/**
 * Verifica el estado de un proveedor haciendo ping
 */
async function checkProviderHealth(
  provider: any,
  index: number
): Promise<{
  index: number;
  address: string;
  pdpUrl: string;
  status: "ok" | "error" | "timeout";
  error?: string;
  responseTime?: number;
}> {
  const start = Date.now();

  try {
    // Intentar hacer fetch a la URL del proveedor
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout

    try {
      const response = await fetch(provider.pdpUrl, {
        method: "GET",
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - start;

      if (response.ok) {
        return {
          index: index + 1,
          address: provider.owner,
          pdpUrl: provider.pdpUrl,
          status: "ok",
          responseTime,
        };
      } else {
        return {
          index: index + 1,
          address: provider.owner,
          pdpUrl: provider.pdpUrl,
          status: "error",
          error: `HTTP ${response.status}: ${response.statusText}`,
          responseTime,
        };
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      const responseTime = Date.now() - start;

      if (fetchError.name === "AbortError") {
        return {
          index: index + 1,
          address: provider.owner,
          pdpUrl: provider.pdpUrl,
          status: "timeout",
          error: "Timeout después de 5 segundos",
          responseTime,
        };
      }

      return {
        index: index + 1,
        address: provider.owner,
        pdpUrl: provider.pdpUrl,
        status: "error",
        error: fetchError.message || "Error desconocido",
        responseTime,
      };
    }
  } catch (error: any) {
    return {
      index: index + 1,
      address: provider.owner,
      pdpUrl: provider.pdpUrl,
      status: "error",
      error: error.message || "Error desconocido",
    };
  }
}

/**
 * Función principal
 */
async function checkProviders() {
  console.log("=".repeat(70));
  console.log("🔍 VERIFICACIÓN DE PROVEEDORES DE FILECOIN");
  console.log("=".repeat(70));
  console.log();

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY no encontrado en .env");
  }

  const rpcURL = process.env.RPC_URL || RPC_URLS.calibration.http;

  console.log("📦 Inicializando SDK...");
  const synapse = await Synapse.create({
    privateKey: privateKey,
    rpcURL: rpcURL,
  });
  console.log(`✅ SDK inicializado`);
  console.log(`📍 RPC: ${rpcURL}`);
  console.log(`🔑 Wallet: ${await synapse.getSigner().getAddress()}\n`);

  console.log("📋 Obteniendo información de proveedores...");
  const storageInfo = await synapse.getStorageInfo();
  const providers = storageInfo.providers;

  if (providers.length === 0) {
    console.log("❌ No hay proveedores disponibles en la red");
    return;
  }

  console.log(`✅ Encontrados ${providers.length} proveedores\n`);

  console.log("=".repeat(70));
  console.log("📊 INFORMACIÓN DE PROVEEDORES");
  console.log("=".repeat(70));
  console.log();

  // Mostrar información básica
  providers.forEach((provider: any, index: number) => {
    console.log(`Proveedor ${index + 1}:`);
    console.log(`   📍 Dirección: ${provider.owner}`);
    console.log(`   🔗 PDP URL: ${provider.pdpUrl || "N/A"}`);
    console.log(`   🔗 Retrieval URL: ${provider.pieceRetrievalUrl || "N/A"}`);
    console.log(
      `   📅 Registrado: ${new Date(
        provider.registeredAt * 1000
      ).toLocaleString()}`
    );
    console.log(
      `   ✅ Aprobado: ${new Date(provider.approvedAt * 1000).toLocaleString()}`
    );
    console.log();
  });

  console.log("=".repeat(70));
  console.log("🏥 VERIFICACIÓN DE SALUD (Health Check)");
  console.log("=".repeat(70));
  console.log();
  console.log("Probando conectividad con cada proveedor...\n");

  // Verificar salud de cada proveedor
  const healthChecks = await Promise.all(
    providers.map((provider: any, index: number) =>
      checkProviderHealth(provider, index)
    )
  );

  // Mostrar resultados
  let healthyCount = 0;
  let errorCount = 0;
  let timeoutCount = 0;

  healthChecks.forEach((check) => {
    const statusIcon =
      check.status === "ok" ? "✅" : check.status === "timeout" ? "⏱️" : "❌";

    console.log(
      `${statusIcon} Proveedor ${check.index} (${check.address.substring(
        0,
        10
      )}...)`
    );
    console.log(`   URL: ${check.pdpUrl}`);

    if (check.status === "ok") {
      console.log(`   Estado: ✅ FUNCIONANDO`);
      console.log(`   Tiempo de respuesta: ${check.responseTime}ms`);
      healthyCount++;
    } else if (check.status === "timeout") {
      console.log(`   Estado: ⏱️  TIMEOUT`);
      console.log(`   Error: ${check.error}`);
      timeoutCount++;
    } else {
      console.log(`   Estado: ❌ ERROR`);
      console.log(`   Error: ${check.error}`);
      errorCount++;
    }
    console.log();
  });

  // Resumen
  console.log("=".repeat(70));
  console.log("📊 RESUMEN");
  console.log("=".repeat(70));
  console.log();
  console.log(`Total de proveedores: ${providers.length}`);
  console.log(`✅ Funcionando: ${healthyCount}`);
  console.log(`❌ Con errores: ${errorCount}`);
  console.log(`⏱️  Timeout: ${timeoutCount}`);
  console.log();

  if (healthyCount === 0) {
    console.log(
      "⚠️  ADVERTENCIA: Ningún proveedor está funcionando actualmente"
    );
    console.log(
      "   Esto puede ser temporal. Intenta de nuevo en unos minutos."
    );
    console.log();
    console.log("💡 Recomendaciones:");
    console.log("   1. Espera 10-15 minutos y vuelve a verificar");
    console.log("   2. Verifica tu conexión a internet");
    console.log(
      "   3. Los proveedores en testnet pueden estar en mantenimiento"
    );
  } else if (healthyCount < providers.length) {
    console.log("⚠️  Algunos proveedores no están disponibles");
    console.log(
      `   Puedes intentar usar uno de los ${healthyCount} proveedores funcionando`
    );
  } else {
    console.log("✅ Todos los proveedores están funcionando correctamente");
    console.log("   Puedes proceder con el upload de imágenes");
  }

  // Guardar resultados en archivo
  const results = {
    timestamp: new Date().toISOString(),
    network: "calibration",
    rpc: rpcURL,
    totalProviders: providers.length,
    healthy: healthyCount,
    errors: errorCount,
    timeouts: timeoutCount,
    providers: healthChecks.map((check, index) => ({
      index: check.index,
      address: check.address,
      pdpUrl: check.pdpUrl,
      status: check.status,
      error: check.error,
      responseTime: check.responseTime,
    })),
  };

  const resultsPath = join(process.cwd(), "provider-status.json");
  await writeFile(resultsPath, JSON.stringify(results, null, 2));
  console.log();
  console.log(`💾 Resultados guardados en: ${resultsPath}`);
  console.log();
}

// Ejecutar verificación
checkProviders()
  .then(() => {
    console.log("✅ Verificación completada");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error durante la verificación:");
    console.error(error.message);
    if (error.stack) {
      console.error("\nStack trace:");
      console.error(error.stack);
    }
    process.exit(1);
  });
