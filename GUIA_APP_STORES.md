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

### 2.1 Keystore de firma — dónde está y cómo configurarlo

El keystore (`miraquetecomo-release.keystore`) es la llave que identifica la app en Google Play. **Sin ella no podés publicar actualizaciones.** Guardala siempre en un lugar seguro fuera del repositorio (por ejemplo, en un gestor de contraseñas como 1Password o Bitwarden).

**El keystore está almacenado de forma segura en Replit Secrets** con las siguientes variables:
- `KEYSTORE_PASSWORD` — contraseña del archivo keystore
- `KEY_ALIAS` — alias de la llave (normalmente `miraquetecomo`)
- `KEY_PASSWORD` — contraseña del alias

Si necesitás restaurar el keystore (por ejemplo, en un workspace nuevo), tenés que volver a subir el archivo `.jks` y configurar estos Secrets en Replit. Para convertir el archivo a texto y guardarlo como secret `KEYSTORE_BASE64`:

**En Mac:**
```bash
base64 -i miraquetecomo-release.keystore | tr -d '\n'
```
**En Linux/Windows WSL:**
```bash
base64 -w 0 miraquetecomo-release.keystore
```
Copiá el resultado y pegalo como el secret `KEYSTORE_BASE64` en Replit (Secrets → New Secret).

⚠️ **Los archivos `.keystore` y `.jks` están en `.gitignore` y nunca se suben al repositorio.** Si trabajás localmente, podés poner el keystore en `android/app/` y las contraseñas en `android/keystore.properties` (también ignorado por git).

### 2.2 Compilar el AAB desde Replit

Con el keystore en su lugar, podés generar el AAB directamente desde la consola de Replit:

```bash
# 1. Instalar Android SDK (solo la primera vez, o si no está instalado)
mkdir -p android-sdk && curl -L "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip" -o /tmp/cmdline-tools.zip
cd android-sdk && unzip -qo /tmp/cmdline-tools.zip && mkdir -p cmdline-tools/latest && mv cmdline-tools/* cmdline-tools/latest/ 2>/dev/null; cd ..
export ANDROID_HOME=/home/runner/workspace/android-sdk && export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$PATH
yes | sdkmanager --licenses && sdkmanager "platform-tools" "build-tools;36.0.0" "platforms;android-36"
echo "sdk.dir=/home/runner/workspace/android-sdk" > android/local.properties

# 2. Sincronizar los assets web más recientes
npx cap sync android

# 3. Compilar el AAB firmado
export ANDROID_HOME=/home/runner/workspace/android-sdk
export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH
export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))
cd android && ./gradlew bundleRelease --no-daemon
```

El AAB resultante queda en `android/app/build/outputs/bundle/release/app-release.aab`.

### 2.3 Crear cuenta de Google Play Developer

1. Andá a https://play.google.com/console
2. Registrate con una cuenta de Google
3. Pagá los $25 USD (pago único)
4. Completá la verificación de identidad

### 2.4 Subir la app a Google Play

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

**Para Android (desde la consola de Replit):**
1. Incrementá `versionCode` y `versionName` en `android/app/build.gradle`
2. Ejecutá en la consola de Replit:
   ```bash
   npx cap sync android
   export ANDROID_HOME=/home/runner/workspace/android-sdk
   export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH
   export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))
   cd android && ./gradlew bundleRelease --no-daemon
   ```
3. Descargá el nuevo `android/app/build/outputs/bundle/release/app-release.aab`
4. Subilo en Google Play Console como nueva versión

**Para iOS (requiere Mac con Xcode):**
1. Descargá el proyecto actualizado
2. En tu computadora: `npm install && npx cap sync ios`
3. Abrí Xcode y generá un nuevo archive
4. Subí la nueva versión a App Store Connect

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
