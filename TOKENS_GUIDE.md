# 🪙 Guía de Tokens para Filecoin Calibration

## 📋 Resumen

Para usar Filecoin Synapse SDK necesitas **2 tipos de tokens** en la red **Calibration (testnet)**:

1. **tFIL** - Para pagar gas (comisiones de transacciones)
2. **USDFC** - Para pagar el almacenamiento de datos

## 🔑 Tu Wallet Address

```
0xAF48DdBDea966694a06fb979b11618D71EdbE814
```

**⚠️ IMPORTANTE**: Todos los tokens deben enviarse a esta dirección.

## 🚰 Opción 1: Obtener Tokens Gratis (Faucets)

### 1. Obtener tFIL (para gas)

**Faucet**: https://faucet.calibnet.chainsafe-fil.io/funds.html

**Pasos**:
1. Abre el link
2. Pega tu dirección: `0xAF48DdBDea966694a06fb979b11618D71EdbE814`
3. Haz clic en "Request Funds"
4. Espera unos minutos para recibir los tokens

### 2. Obtener USDFC (para storage)

**Faucet**: https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc

**Pasos**:
1. Abre el link
2. Pega tu dirección: `0xAF48DdBDea966694a06fb979b11618D71EdbE814`
3. Haz clic en "Request" o similar
4. Espera unos minutos para recibir los tokens

## 💸 Opción 2: Enviar desde Otra Wallet

Si ya tienes tokens en otra wallet de Calibration, envíalos a:

```
0xAF48DdBDea966694a06fb979b11618D71EdbE814
```

### Cómo Enviar desde MetaMask

1. Abre MetaMask
2. Asegúrate de estar en la red **Filecoin Calibration**
   - Si no la tienes, agrega: https://chainlist.org/chain/314159
3. Selecciona el token (tFIL o USDFC)
4. Haz clic en "Send"
5. Pega la dirección: `0xAF48DdBDea966694a06fb979b11618D71EdbE814`
6. Ingresa la cantidad
7. Confirma la transacción

## 💰 Cantidades Recomendadas

Para probar el sistema necesitas:

- **tFIL**: Mínimo `0.01 tFIL` (para varias transacciones)
- **USDFC**: Mínimo `0.5 USDFC` (para almacenar imágenes de prueba)

**Nota**: Los faucets suelen dar suficiente para empezar.

## 🔍 Verificar Balance

Puedes verificar tus balances en:

- **Explorador de Calibration**: https://calibration.filfox.info/
- Busca tu dirección: `0xAF48DdBDea966694a06fb979b11618D71EdbE814`

## ❓ ¿Por Qué Necesito Estos Tokens?

### tFIL (Token FIL de Test)
- Se usa para pagar las **comisiones de gas** de todas las transacciones
- Cada transacción en blockchain requiere gas
- Sin tFIL, no puedes hacer transacciones

### USDFC (USD Filecoin Coin)
- Se usa para pagar el **almacenamiento** de tus datos
- El SDK deposita USDFC en un contrato de pagos
- El servicio de storage cobra automáticamente según cuánto almacenes
- Sin USDFC, no puedes subir archivos

## 🐛 Problemas Comunes

### "Insufficient funds"
- No tienes suficientes tokens
- Obtén más de los faucets o envía desde otra wallet

### "missing revert data" o errores de RPC
- Puede ser un problema temporal del RPC
- El código ahora maneja esto mejor y continúa
- Si persiste, cambia el `RPC_URL` en `.env`

### Los tokens no aparecen
- Espera unos minutos (las transacciones pueden tardar)
- Verifica en el explorador: https://calibration.filfox.info/
- Asegúrate de estar en la red Calibration, no Mainnet

## 📝 Resumen Rápido

1. **Tu dirección**: `0xAF48DdBDea966694a06fb979b11618D71EdbE814`
2. **Obtén tFIL**: https://faucet.calibnet.chainsafe-fil.io/funds.html
3. **Obtén USDFC**: https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc
4. **O envía desde otra wallet** a la dirección de arriba
5. **Ejecuta el test**: `npm run test:image`

¡Listo! 🚀

