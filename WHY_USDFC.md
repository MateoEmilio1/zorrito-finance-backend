# 🤔 ¿Por Qué Necesito USDFC si Ya Tengo tFIL?

## La Diferencia Clave

Son **dos tokens diferentes** para **dos propósitos diferentes**:

### 1. **tFIL** (Token FIL de Test) ✅ Ya lo tienes
- **Para qué**: Pagar **gas** (comisiones de transacciones)
- **Cuándo se usa**: En **cADA transacción** que haces en blockchain
- **Por qué no da error**: Porque ya tienes tFIL, puedes hacer transacciones
- **Ejemplo**: Cuando depositas USDFC, pagas el gas con tFIL

### 2. **USDFC** (USD Filecoin Coin) ❌ Te falta este
- **Para qué**: Pagar el **almacenamiento** de tus datos
- **Cuándo se usa**: Cuando subes archivos a Filecoin
- **Por qué necesitas este específicamente**: El contrato de pagos **solo acepta USDFC**, no FIL

## 🔍 Cómo Funciona el Sistema de Pagos

El sistema de Filecoin Onchain Cloud funciona así:

```
1. Tienes tFIL → Pagas gas para hacer transacciones ✅ (ya lo tienes)
2. Depositas USDFC → En un contrato de pagos especial ❌ (te falta esto)
3. El servicio de storage → Cobra USDFC automáticamente ❌ (no puede cobrar sin USDFC)
4. Subes archivos → El servicio usa tu USDFC depositado ❌ (no puede sin USDFC)
```

## 📝 En el Código

Mira la línea 154-157 del código:

```typescript
// Step 3a: Deposit USDFC into payment account
const depositTx = await synapse.payments.deposit(
  depositAmount,
  TOKENS.USDFC  // <-- Específicamente pide USDFC, no FIL
);
```

El contrato `deposit()` **solo acepta USDFC**. Es como si fuera un sistema que solo acepta USDC, no ETH.

## 🎯 Analogía Simple

Imagina que estás en un restaurante:

- **tFIL** = Dinero para pagar la propina al mesero (gas)
- **USDFC** = Dinero para pagar la comida (almacenamiento)

Puedes tener propina (tFIL) pero si no tienes dinero para la comida (USDFC), no puedes comer.

## ✅ Resumen

- **tFIL** ✅ Ya lo tienes → Para gas (transacciones)
- **USDFC** ❌ Te falta → Para storage (almacenamiento)

**Necesitas ambos** porque:
- Sin tFIL → No puedes hacer transacciones
- Sin USDFC → No puedes pagar el almacenamiento

## 🚀 Solución

Obtén USDFC del faucet:
https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc

O envía USDFC desde tu otra wallet a:
`0xAF48DdBDea966694a06fb979b11618D71EdbE814`

