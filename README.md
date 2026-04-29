# La Maldición de Strahd - Planificador

Planificador compartido para una campaña de Dungeons & Dragons. Los jugadores pueden iniciar sesión, marcar disponibilidad, editar su perfil, consultar hechizos, preparar listas y mantener una wiki de campaña.

Los datos compartidos de calendario, perfiles y wiki se guardan en Firestore para que los cambios aparezcan automáticamente en todos los navegadores abiertos.

## Requisitos

- Node.js 20.19+
- Un proyecto de Firebase con Firestore habilitado

## Configurar Firestore

1. Crea o reutiliza un proyecto de Firebase y añade una aplicación web para obtener las claves del SDK.
2. En **Build -> Firestore Database**, crea la base de datos y elige la región.
3. Crea estas colecciones iniciales:
   - `players`: un documento por jugador. Usa el `id` del jugador como ID del documento y añade `name`, `role`, `color`, `borderColor`, `textColor`, `password`, `imageUrl` e `id`.
   - `scheduleEntries`: un documento por combinación de fecha y jugador. Un formato cómodo para el ID es `${date}_${playerId}`. Campos: `date`, `playerId`, `availability`.
   - `wiki`: documentos de páginas de campaña, creados desde la propia app.

### Reglas de desarrollo

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /wiki/{document=**} {
      allow read, write: if true;
    }
    match /players/{player} {
      allow read, write: if true;
    }
    match /scheduleEntries/{entry} {
      allow read, write: if true;
    }
  }
}
```

Endurece estas reglas antes de usar la app en un entorno que no controles.

## Variables de entorno

Copia `.env.example` a `.env.local` y rellena los valores de tu proyecto:

```bash
VITE_FIREBASE_API_KEY="..."
VITE_FIREBASE_AUTH_DOMAIN="..."
VITE_FIREBASE_PROJECT_ID="..."
VITE_FIREBASE_STORAGE_BUCKET="..."
VITE_FIREBASE_MESSAGING_SENDER_ID="..."
VITE_FIREBASE_APP_ID="..."
```

`.env.local` está ignorado por Git.

## Desarrollo

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Personalización

Desde el panel **Tu Identidad** cada jugador puede:

- Cambiar su contraseña privada.
- Seleccionar cualquiera de los temas definidos en `THEME_COLORS`.
- Elegir entre los emoticonos temáticos definidos en `EMOTICON_OPTIONS`.
- Actualizar los colores del avatar y de los acentos de la UI sin preparar imágenes nuevas.

## Build y despliegue

```bash
npm run build
npm run preview
npm run deploy
```

Configura las mismas variables `VITE_FIREBASE_*` en el entorno de despliegue.
