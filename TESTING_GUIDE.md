# 🧪 Guía de Testing - Almacenamiento en Filecoin

Esta guía explica cómo testear que el almacenamiento en Filecoin funciona correctamente.

## 📋 Comandos Disponibles

### 1. Test Básico de Upload/Download

```bash
npm run test:image
```

**Qué hace:**

- Sube una imagen a Filecoin
- La descarga de vuelta
- Guarda la imagen descargada

**Cuándo usar:**

- Para probar el flujo básico
- Para verificar que tienes tokens configurados

---

### 2. Test Completo de Verificación ⭐ RECOMENDADO

```bash
npm run test:storage
```

**Qué hace:**

- ✅ Sube una imagen
- ✅ Descarga y verifica integridad (hash SHA256)
- ✅ Prueba múltiples descargas (3 veces)
- ✅ Verifica que el PieceCID es consistente
- ✅ Compara bytes originales vs descargados
- ✅ Guarda la imagen verificada

**Cuándo usar:**

- Para verificar que el almacenamiento funciona correctamente
- Para asegurar que los datos no se corrompen
- Para probar la persistencia de los datos

**Qué verifica:**

- ✅ Los datos descargados son idénticos a los originales
- ✅ El PieceCID siempre devuelve los mismos datos
- ✅ Múltiples descargas funcionan correctamente
- ✅ La integridad de los datos está garantizada

---

### 3. Test de Descarga por PieceCID

```bash
npm run test:download <PIECECID>
```

**Qué hace:**

- Descarga una imagen usando su PieceCID
- Verifica que se puede descargar
- Guarda la imagen descargada

**Cuándo usar:**

- Cuando ya subiste una imagen y quieres descargarla de nuevo
- Para verificar que los datos persisten en el tiempo
- Para probar descargas de diferentes PieceCIDs

**Ejemplo:**

```bash
npm run test:download baga6ea4seaq...
```

---

### 4. Verificar Balance de Tokens

```bash
npm run get-usdfc
```

**Qué hace:**

- Verifica tu balance de USDFC
- Te guía para obtener más tokens si es necesario

---

## 🎯 Flujo de Testing Recomendado

### Paso 1: Verificar que tienes tokens

```bash
npm run get-usdfc
```

### Paso 2: Test completo de almacenamiento

```bash
npm run test:storage
```

Este test verifica:

- ✅ Upload funciona
- ✅ Download funciona
- ✅ Integridad de datos (hash SHA256)
- ✅ Múltiples descargas
- ✅ Persistencia del PieceCID

### Paso 3: Guardar el PieceCID

Cuando el test pase, guarda el PieceCID que se muestra. Lo necesitarás para descargas futuras.

### Paso 4: Test de descarga (opcional)

Si quieres probar descargar una imagen que ya subiste:

```bash
npm run test:download <TU_PIECECID>
```

---

## ✅ Qué Verificar en los Tests

### Test Exitoso Debe Mostrar:

1. **Upload exitoso:**

   ```
   ✅ Upload completado
   📋 PieceCID: baga6ea4seaq...
   📊 Tamaño subido: X bytes
   ```

2. **Download exitoso:**

   ```
   ✅ Download completado
   📊 Tamaño descargado: X bytes
   ```

3. **Integridad verificada:**

   ```
   ✅ Tamaño coincide: true
   ✅ Bytes coinciden: true
   ✅ Hash coincide: true
   ```

4. **Múltiples descargas:**
   ```
   Descarga 1: XXXms - ✅ OK
   Descarga 2: XXXms - ✅ OK
   Descarga 3: XXXms - ✅ OK
   ```

---

## 🐛 Troubleshooting

### "Insufficient USDFC balance"

- Obtén USDFC del faucet: https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc
- Verifica con: `npm run get-usdfc`

### "Los datos no coinciden"

- Esto es un error grave - significa que los datos se corrompieron
- Verifica tu conexión a internet
- Intenta de nuevo
- Si persiste, puede ser un problema con el proveedor de storage

### "Error al descargar"

- Verifica que el PieceCID es correcto
- Asegúrate de que la imagen fue subida exitosamente
- Verifica tu conexión a internet
- El proveedor puede estar temporalmente no disponible

### "Upload muy lento"

- Es normal que los uploads tomen 30-60 segundos
- El SDK necesita:
  - Seleccionar un proveedor
  - Subir los datos
  - Esperar confirmaciones de blockchain

---

## 📊 Métricas a Observar

### Tiempos Normales:

- **Upload**: 30-60 segundos
- **Download**: 5-15 segundos
- **Múltiples descargas**: Similar al download inicial

### Tamaños:

- Verifica que el tamaño descargado coincide exactamente con el original
- Cualquier diferencia indica corrupción de datos

### Hashes:

- El hash SHA256 debe ser idéntico entre original y descargado
- Si los hashes no coinciden, los datos están corruptos

---

## 💡 Tips

1. **Guarda tus PieceCIDs**: Son la única forma de recuperar tus datos
2. **Verifica integridad siempre**: Usa `test:storage` para verificación completa
3. **Prueba múltiples veces**: Asegúrate de que funciona consistentemente
4. **Monitorea tus tokens**: Usa `get-usdfc` para verificar balance

---

## 🎉 Test Exitoso

Cuando todos los tests pasen, verás:

```
🎉 TODOS LOS TESTS PASARON EXITOSAMENTE
✅ Upload exitoso
✅ Download exitoso
✅ Integridad verificada
✅ Múltiples descargas exitosas
✅ Persistencia verificada
```

¡Tu sistema de almacenamiento está funcionando correctamente! 🚀
