# 🔧 Solución para Errores de Proveedores

## ❌ Error que Estás Viendo

```
All 3 available storage providers failed ping validation
```

Este error significa que todos los proveedores de storage en la red Calibration están temporalmente no disponibles o tienen problemas de conectividad.

## 🔍 ¿Por Qué Pasa Esto?

Los proveedores pueden fallar por:
- **502 Bad Gateway**: El servidor del proveedor está caído o sobrecargado
- **fetch failed**: Problemas de red o timeout
- **Mantenimiento**: Los proveedores pueden estar en mantenimiento
- **Problemas temporales**: La red de testnet puede tener problemas intermitentes

## ✅ Soluciones Implementadas

### 1. Reintentos Automáticos

El código ahora:
- ✅ Intenta hasta 3 veces automáticamente
- ✅ Espera 5 segundos entre intentos
- ✅ Prueba cada proveedor secuencialmente
- ✅ Muestra qué proveedor está probando

### 2. Especificar Proveedor Manualmente

Puedes especificar un proveedor específico en `.env`:

```env
PROVIDER_ID=1
```

Esto fuerza al SDK a usar el proveedor con ID 1, saltándose el ping test.

### 3. Ver Proveedores Disponibles

Para ver qué proveedores están disponibles, puedes crear un script rápido:

```bash
node -e "
import('@filoz/synapse-sdk').then(async ({ Synapse, RPC_URLS }) => {
  const synapse = await Synapse.create({
    privateKey: process.env.PRIVATE_KEY,
    rpcURL: process.env.RPC_URL || RPC_URLS.calibration.http
  });
  const info = await synapse.getStorageInfo();
  console.log('Proveedores:', info.providers.map((p, i) => ({ id: i+1, address: p.owner })));
});
"
```

## 🚀 Qué Hacer Ahora

### Opción 1: Esperar y Reintentar (Recomendado)

El código ahora tiene reintentos automáticos. Simplemente ejecuta de nuevo:

```bash
npm run test:image
```

El script intentará automáticamente hasta 3 veces con diferentes proveedores.

### Opción 2: Especificar Proveedor Manualmente

1. Edita `.env` y agrega:
   ```env
   PROVIDER_ID=1
   ```

2. Ejecuta de nuevo:
   ```bash
   npm run test:image
   ```

Si el proveedor 1 no funciona, prueba con 2, 3, etc.

### Opción 3: Esperar unos minutos

Los proveedores pueden estar temporalmente sobrecargados. Espera 5-10 minutos y vuelve a intentar.

## 📊 Cómo Funciona Ahora

```
Intento 1:
  ├─ Probar proveedor 1 → ❌ Falla
  ├─ Probar proveedor 2 → ❌ Falla  
  └─ Probar proveedor 3 → ❌ Falla
  → Esperar 5 segundos

Intento 2:
  ├─ Probar proveedor 1 → ❌ Falla
  ├─ Probar proveedor 2 → ✅ Funciona!
  └─ Continuar con upload
```

## 💡 Tips

1. **Los proveedores en testnet son menos estables** que en mainnet
2. **Es normal que fallen ocasionalmente** - por eso hay reintentos
3. **Si todos fallan**, espera unos minutos y vuelve a intentar
4. **Especificar un PROVIDER_ID** puede ayudar si sabes cuál funciona

## 🐛 Si Persiste el Error

Si después de varios intentos sigue fallando:

1. **Verifica tu conexión a internet**
2. **Espera 10-15 minutos** (puede ser mantenimiento)
3. **Prueba con un proveedor específico** usando `PROVIDER_ID`
4. **Revisa el estado de la red Calibration** en el explorador

## 📝 Nota

Este es un problema común en redes de testnet. En producción (mainnet), los proveedores son más estables y confiables.

