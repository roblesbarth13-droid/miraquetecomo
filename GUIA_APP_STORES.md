# Guía para publicar "Mirá que te como" en las App Stores

Esta guía te va a llevar paso a paso para publicar la app en Google Play y Apple App Store.

---

## PARTE 1: Preparar tu computadora

### 1.1 Instalar Node.js

1. Andá a https://nodejs.org
2. Descargá la versión LTS (la que dice "Recomendado")
3. Instalalo con las opciones por defecto
4. Para verificar que se instaló, abrí una terminal (CMD en Windows, Terminal en Mac) y escribí:
   ```
   node --version
   ```
   Debería mostrar algo como `v20.x.x`

### 1.2 Descargar el proyecto desde Replit

1. En Replit, hacé click en los tres puntos (⋯) del proyecto
2. Seleccioná "Download as zip"
3. Descomprimí el archivo en una carpeta de tu computadora (ejemplo: `C:\miraquetecomo` o `~/miraquetecomo`)

### 1.3 Instalar dependencias

Abrí una terminal en la carpeta del proyecto y ejecutá:
```
npm install
```

---

## PARTE 2: Publicar en Google Play (Android)

### 2.1 Instalar Android Studio

1. Andá a https://developer.android.com/studio
2. Descargá e instalá Android Studio
3. Abrilo una vez para que descargue los SDKs necesarios (tarda un rato la primera vez)
4. Aceptá las licencias cuando te lo pida

### 2.2 Generar el proyecto Android

En la terminal, dentro de la carpeta del proyecto, ejecutá estos comandos en orden:
```
npx cap add android
npx cap sync android
```

### 2.3 Generar los íconos automáticamente

Capacitor tiene una herramienta que genera todos los íconos y splash screens en los tamaños correctos. Ejecutá:
```
npx @capacitor/assets generate --android
```

Esto usa la imagen `resources/icon.png` (que ya está preparada) y genera todos los tamaños necesarios automáticamente.

Si preferís hacerlo manualmente, los íconos pre-generados están en `resources/android/` y podés copiarlos:
```
cp resources/android/icon-mdpi.png android/app/src/main/res/mipmap-mdpi/ic_launcher.png
cp resources/android/icon-hdpi.png android/app/src/main/res/mipmap-hdpi/ic_launcher.png
cp resources/android/icon-xhdpi.png android/app/src/main/res/mipmap-xhdpi/ic_launcher.png
cp resources/android/icon-xxhdpi.png android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
cp resources/android/icon-xxxhdpi.png android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
```

En Windows usá `copy` en vez de `cp`, o simplemente copiá y pegá los archivos manualmente.

### 2.4 Abrir en Android Studio

```
npx cap open android
```

Esto abre el proyecto en Android Studio.

### 2.5 Generar el archivo .aab (Android App Bundle)

En Android Studio:
1. Menú **Build** → **Generate Signed Bundle / APK**
2. Seleccioná **Android App Bundle**
3. Hacé click en **Create new...** para crear un keystore (guardalo en un lugar seguro, lo vas a necesitar para futuras actualizaciones)
4. Completá los datos del keystore (contraseña, alias, etc.)
5. Seleccioná **release** y hacé click en **Finish**
6. El archivo .aab se genera en `android/app/release/app-release.aab`

**IMPORTANTE:** Guardá el archivo keystore y las contraseñas en un lugar seguro. Sin ellos no vas a poder actualizar la app en el futuro.

### 2.6 Crear cuenta de Google Play Developer

1. Andá a https://play.google.com/console
2. Registrate con una cuenta de Google
3. Pagá los $25 USD (pago único)
4. Completá la verificación de identidad

### 2.7 Subir la app a Google Play

1. En Google Play Console, hacé click en **Crear aplicación**
2. Completá:
   - **Nombre**: Mirá que te como
   - **Idioma**: Español (Argentina)
   - **Tipo**: Aplicación
   - **Gratuita**
3. En la sección **Versiones** → **Producción**, subí el archivo .aab
4. Completá la **Ficha de Play Store**:
   - **Descripción breve**: Comprá comida con descuento de comercios locales
   - **Descripción completa**: Mirá que te como conecta comercios que tienen sobrantes del día con usuarios que quieren comprar comida con hasta 70% de descuento. Ahorrá plata y ayudá a reducir el desperdicio de alimentos.
   - **Capturas de pantalla**: Tomá capturas de la app desde el emulador de Android Studio (al menos 2)
   - **Ícono**: Subí `resources/android/icon-playstore.png` (512x512)
   - **Categoría**: Comida y bebida
5. Completá las declaraciones de privacidad (usá la URL: https://miraquetecomo.replit.app/privacidad)
6. Enviá a revisión

La revisión de Google suele tardar entre 1 y 7 días.

---

## PARTE 3: Publicar en Apple App Store (iOS)

**Requisito:** Necesitás una Mac con Xcode instalado.

### 3.1 Instalar Xcode

1. Abrí la App Store en tu Mac
2. Buscá "Xcode" e instalalo (es gratis, pero pesa unos 12 GB)
3. Abrilo una vez para aceptar las licencias

### 3.2 Generar el proyecto iOS

En la terminal, dentro de la carpeta del proyecto:
```
npx cap add ios
npx cap sync ios
```

### 3.3 Generar los íconos automáticamente

```
npx @capacitor/assets generate --ios
```

Esto genera todos los tamaños de ícono necesarios para iOS (son muchos más que Android). Si preferís hacerlo manualmente, los íconos base están en `resources/ios/`.

### 3.4 Abrir en Xcode

```
npx cap open ios
```

### 3.5 Crear cuenta de Apple Developer

1. Andá a https://developer.apple.com/programs/
2. Registrate con un Apple ID
3. Pagá los $99 USD/año

### 3.6 Compilar y subir

1. En Xcode, seleccioná tu Team (cuenta de Apple Developer) en los ajustes del proyecto
2. Seleccioná **Product** → **Archive**
3. Cuando termine, hacé click en **Distribute App**
4. Seleccioná **App Store Connect**
5. Seguí los pasos del asistente

### 3.7 Completar la ficha en App Store Connect

1. Andá a https://appstoreconnect.apple.com
2. Completá la información de la app (similar a Google Play)
3. **URL de privacidad**: https://miraquetecomo.replit.app/privacidad
4. Enviá a revisión

La revisión de Apple suele tardar entre 1 y 3 días, pero pueden pedir cambios.

---

## Datos importantes para las fichas

- **Nombre**: Mirá que te como
- **ID de la app**: com.miraquetecomo.app
- **Categoría**: Comida y bebida / Estilo de vida
- **URL de privacidad**: https://miraquetecomo.replit.app/privacidad
- **URL de términos**: https://miraquetecomo.replit.app/terminos
- **Contacto**: roblesbarth13@gmail.com
- **País**: Argentina

---

## Actualizaciones futuras

Cuando hagas cambios en la app desde Replit:

1. Descargá el proyecto actualizado
2. En tu computadora:
   ```
   npm install
   npx cap sync android
   npx cap sync ios
   ```
3. Abrí Android Studio / Xcode
4. Generá un nuevo .aab / archive
5. Subí la nueva versión a las stores (incrementá el número de versión)

---

## Solución de problemas comunes

### "El emulador no arranca"
- Asegurate de tener habilitada la virtualización en la BIOS de tu computadora

### "Error de SDK no encontrado"
- En Android Studio: File → Settings → Appearance & Behavior → System Settings → Android SDK → Instalá el SDK que te falte

### "La app muestra pantalla en blanco"
- Verificá que la URL del servidor en `capacitor.config.ts` sea correcta: `https://miraquetecomo.replit.app`
- Verificá que tenés conexión a internet en el dispositivo/emulador

### "Google rechaza la app"
- Asegurate de completar TODAS las secciones de la ficha, incluyendo la política de privacidad y las capturas de pantalla
- Agregá al menos 2 capturas de pantalla del teléfono y 1 de tablet

### "Los íconos no se ven bien"
- Ejecutá `npx @capacitor/assets generate` para regenerar todos los tamaños automáticamente
- La imagen fuente (`resources/icon.png`) debe ser de al menos 1024x1024 píxeles (la nuestra es 2048x2048, perfecto)

### "Apple rechaza por ser solo una web"
- Nuestra app tiene funcionalidad real: pagos con Mercado Pago, QR de retiro, mapa con geolocalización, notificaciones. Esto la distingue de un simple sitio web empaquetado
- Si Apple pide mejoras, podemos agregar funcionalidad nativa adicional
