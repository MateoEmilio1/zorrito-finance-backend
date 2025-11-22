# 📚 Recursos Adicionales para Filecoin Onchain Cloud

Esta guía contiene recursos útiles para trabajar con Filecoin Onchain Cloud.

## 🪙 Obtener Tokens USDFC

### Filecoin Mainnet

- **Bridge/Swap tokens a USDFC**: [Squid Router](https://app.squidrouter.com/)
- **Depositar FIL como colateral para obtener USDFC**: [USDFC Website](https://app.usdfc.net/#/)

### Calibration Testnet

- **Obtener tUSDFC tokens**: [Calibration Testnet tUSDFC Faucet](https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc)
- **Depositar tFIL como colateral para obtener tUSDFC**: [USDFC Website](https://app.usdfc.net/#/)

## 🔍 Exploradores de Filecoin Onchain Cloud

### PDP Explorer

Rastrea las pruebas (proofs) enviadas al contrato PDP.

- **Filecoin Mainnet**: https://pdp.vxb.ai/mainnet
- **Calibration Testnet**: https://pdp.vxb.ai/calibration

**Qué puedes ver aquí:**
- Estado de las pruebas de datos
- Historial de verificaciones
- Información de los proveedores

### Filecoin Pay Explorer

Rastrea tus rails de pago y pagos.

- **Filecoin Mainnet**: https://pay.filecoin.services/
- **Calibration Testnet**: https://staging-pay.filecoin.services/

**Qué puedes ver aquí:**
- Tus depósitos de USDFC
- Aprobaciones de servicios
- Historial de pagos
- Saldos disponibles

### Storage Providers DealBot

Rastrea la salud y confiabilidad de los proveedores de storage.

- **Filecoin Mainnet**: https://dealbot.fwss.io/
- **Calibration Testnet**: https://dealbot-staging.fwss.io

**Qué puedes ver aquí:**
- Estado de salud de cada proveedor
- Tiempo de respuesta
- Disponibilidad
- Historial de uptime

**💡 Este es especialmente útil cuando los proveedores están fallando!**

## 🌐 Información de Red

### Calibration Testnet

- **Chain ID**: 314159
- **RPC URLs**: https://chainlist.org/chain/314159
- **Block Explorers**:
  - https://filecoin-testnet.blockscout.com
  - https://calibration.filfox.info
  - https://beryx.io/

### Mainnet

- **Chain ID**: 314
- **RPC URLs**: https://chainlist.org/chain/314
- **Block Explorers**:
  - https://filecoin.blockscout.com
  - https://filfox.info
  - https://beryx.io/

## 🛠️ Cómo Usar Estos Recursos

### Cuando los Proveedores Fallan

1. **Verifica DealBot primero**:
   ```
   https://dealbot-staging.fwss.io (para Calibration)
   ```
   Esto te dirá si es un problema general o específico.

2. **Revisa PDP Explorer**:
   ```
   https://pdp.vxb.ai/calibration
   ```
   Verifica si hay actividad reciente de pruebas.

3. **Verifica tus pagos**:
   ```
   https://staging-pay.filecoin.services/
   ```
   Asegúrate de que tus tokens estén correctamente depositados.

### Para Debugging

- **Block Explorers**: Usa para verificar transacciones
- **DealBot**: Para ver el estado de los proveedores en tiempo real
- **PDP Explorer**: Para verificar que las pruebas se están enviando correctamente

## 📝 Comandos Útiles

### Verificar Proveedores
```bash
npm run check-providers
```

### Verificar Balance
```bash
npm run get-usdfc
```

### Test de Upload
```bash
npm run test:image
```

## 🔗 Links Rápidos

### Calibration Testnet
- [DealBot](https://dealbot-staging.fwss.io)
- [PDP Explorer](https://pdp.vxb.ai/calibration)
- [Pay Explorer](https://staging-pay.filecoin.services/)
- [Faucet USDFC](https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc)
- [Faucet tFIL](https://faucet.calibnet.chainsafe-fil.io/funds.html)

### Mainnet
- [DealBot](https://dealbot.fwss.io/)
- [PDP Explorer](https://pdp.vxb.ai/mainnet)
- [Pay Explorer](https://pay.filecoin.services/)
- [USDFC App](https://app.usdfc.net/#/)

## 💡 Tips

1. **Siempre verifica DealBot primero** cuando tengas problemas con proveedores
2. **Usa los exploradores de bloques** para verificar transacciones
3. **PDP Explorer** es útil para verificar que tus datos están siendo probados correctamente
4. **Pay Explorer** te ayuda a entender tus gastos y saldos

