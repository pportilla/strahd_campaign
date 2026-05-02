# Strahd Campaign Planner

A shared campaign planner for a Dungeons & Dragons table. It is currently tailored for a Spanish-language **Curse of Strahd** game, but the code is intentionally simple enough to adapt to another campaign, another language, or even another tabletop system.

The app includes:

- Player login with lightweight per-player passwords.
- A shared availability calendar.
- Editable player identities, theme colors, and avatars.
- Campaign notes and a Markdown wiki with page history.
- Spell lookup and prepared spell lists.
- A character creator/manager.

This is a small table tool, not an enterprise app. Firebase works and gives easy shared sync, but it is probably more than this project needs. A tiny backend with SQLite, PocketBase, Supabase, or even a JSON file behind a private server would be enough for many groups.

## Current Shape

The project is a Vite + React app. Most of the campaign-specific content is in plain TypeScript files:

- `constants.ts`: starter players, colors, avatar choices, and availability styling.
- `types.ts`: player IDs, schedule shape, wiki page types, and shared app models.
- `services/campaignApi.ts`: calendar/player persistence functions.
- `services/wikiService.ts`: wiki persistence functions.
- `services/spellsService.ts` and `services/characterService.ts`: public D&D API integration.
- `services/spellTranslations.ts` and `services/characterTranslations.ts`: Spanish display translations.
- `components/`: the UI.

The UI copy is mostly Spanish today because this app was built for a Spanish D&D table. To adapt it, translate the component text and the data in the files above.

## Requirements

- Node.js 20.19+
- npm
- Optional: a Firebase project if you want the current shared persistence setup

## Install

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
npm run preview
```

## Deploy

The included deploy script publishes `dist/` to GitHub Pages:

```bash
npm run deploy
```

Update `homepage` and the `deploy` script in `package.json` if your repository name or remote is different.

## Customizing The Campaign

### Players

Edit `types.ts` first:

```ts
export type PlayerId = 'dm' | 'bard' | 'wizard';
```

Then update `INITIAL_PLAYERS` in `constants.ts` so every player has:

- `id`: must match one of the `PlayerId` values.
- `name`: display name.
- `role`: character/class/table role label.
- `color`, `borderColor`, `textColor`: Tailwind classes used by the UI.
- `password`: simple table password.
- `imageUrl`: avatar image URL or generated SVG data URL.

If you are using a database, create matching player records there too. The app reads players from persistence, so `INITIAL_PLAYERS` is mainly the canonical starter roster.

### Language

The current text is Spanish-first. To localize it:

- Translate labels in `components/`.
- Translate theme and avatar names in `constants.ts`.
- Adjust `services/spellTranslations.ts` and `services/characterTranslations.ts`.
- Rename wiki categories in `types.ts` and the wiki components if you want different sections.

### Visual Theme

The global page style lives in `index.html`. Player colors and avatar choices live in `constants.ts`.

The app uses Tailwind utility classes through the CDN script in `index.html`. For a more production-oriented setup, you can replace that with a normal Tailwind build pipeline.

### Calendar Behavior

Availability values are defined in `types.ts`:

```ts
export type Availability = 'available' | 'unavailable' | 'maybe';
```

Their order and colors are in `constants.ts` as `AVAILABILITY_ORDER` and `AVAILABILITY_STYLES`.

## Persistence Options

The app currently uses Firebase Firestore for shared state. That gives quick browser-to-browser sync, but it is not required by the design. The important boundary is the service layer.

Calendar and player data go through:

- `fetchPlayers`
- `fetchSchedule`
- `upsertAvailability`
- `removeAvailability`
- `updatePlayer`
- `subscribeToPlayers`
- `subscribeToSchedule`

Wiki data goes through `wikiService`:

- `getAllPages`
- `getPage`
- `getPageHistory`
- `savePage`
- `deletePage`
- `renamePage`

If you replace those functions while keeping the same return shapes from `types.ts`, the rest of the UI can stay mostly unchanged.

## Connecting Firebase

Use Firebase only if you want a fast hosted setup with shared updates.

1. Create a Firebase project.
2. Create a Web App in that project.
3. Enable Firestore.
4. Copy `public/firebase-config.example.json` to `public/firebase-config.json`.
5. Fill in the values from your Firebase Web App config:

```json
{
  "apiKey": "",
  "authDomain": "",
  "projectId": "",
  "storageBucket": "",
  "messagingSenderId": "",
  "appId": ""
}
```

`public/firebase-config.json` is ignored by git and is only for local development. The deploy script removes `dist/firebase-config.json` before publishing to `gh-pages`, so Firebase config does not get committed into the repository history.

Create these collections:

- `players`
- `scheduleEntries`
- `wiki`

`players` documents should use the player ID as the document ID. Example:

```json
{
  "id": "dm",
  "name": "Dungeon Master",
  "role": "El Tirano de Barovia",
  "color": "bg-red-600",
  "borderColor": "border-red-600",
  "textColor": "text-red-600",
  "password": "strahd",
  "imageUrl": "..."
}
```

`scheduleEntries` documents can use `${date}_${playerId}` as the document ID:

```json
{
  "date": "2026-04-29",
  "playerId": "dm",
  "availability": "available"
}
```

Wiki documents are created from the app. Each wiki page lives in `wiki/{slug}` and its edit history lives under `wiki/{slug}/history`.

For private table use, permissive development rules are convenient:

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

Do not use those rules for a public app. Add authentication or move writes behind a server you control.

## Using Another Database

For most home campaigns, a simpler database is easier to reason about than Firebase. A practical replacement looks like this:

1. Build a tiny API server with endpoints such as:
   - `GET /players`
   - `PUT /players/:id`
   - `GET /schedule`
   - `PUT /schedule/:date/:playerId`
   - `DELETE /schedule/:date/:playerId`
   - `GET /wiki`
   - `PUT /wiki/:slug`
2. Store data in SQLite, Postgres, PocketBase, Supabase, or a JSON file.
3. Rewrite `services/campaignApi.ts` to call your API with `fetch`.
4. Rewrite `services/wikiService.ts` the same way.
5. If you do not need live sync, make `subscribeToPlayers` and `subscribeToSchedule` poll every few seconds or return a no-op unsubscribe function.

Example no-op subscription:

```ts
export const subscribeToPlayers = () => {
  return () => {};
};
```

Example polling subscription:

```ts
export const subscribeToPlayers = (callback: () => void) => {
  const interval = window.setInterval(callback, 5000);
  return () => window.clearInterval(interval);
};
```

If your database stores dates as strings instead of Firestore timestamps, update the wiki history date rendering in `components/Wiki/WikiHistory.tsx` and `components/Wiki/Wiki.tsx`.

## Useful Scripts

```bash
npm run dev      # local development server
npm run build    # production build
npm run preview  # preview the production build
npm run deploy   # publish dist/ to GitHub Pages
```

## Notes

- Passwords are simple table passwords, not secure account authentication.
- The app is best suited to a private group that trusts each other.
- Firebase can be replaced cleanly because persistence is isolated in service files.

## Credits And Provenance

This project was developed in stages. Some early code was written with Gemini, then adapted and expanded by the maintainer, and later cleaned up, documented, and further developed with GPT-5.5 Codex.

## License

This project is licensed under the GNU General Public License v3.0. See `LICENSE` for the full license text.
