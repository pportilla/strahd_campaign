const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const firebaseConfigPath = path.join(dist, 'firebase-config.json');
const googleApiKey = /AIza[0-9A-Za-z_-]{35}/;
const viteFirebaseEnv = /VITE_FIREBASE_|import\.meta\.env\.VITE_FIREBASE_/;
const textExtensions = new Set(['.html', '.js', '.json', '.css', '.map', '.txt', '.xml']);

function fail(message, findings = []) {
  console.error(message);
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

function scan(directory) {
  const leakedGoogleKeys = [];
  const leakedViteEnv = [];

  function walk(currentDirectory) {
    for (const entry of fs.readdirSync(currentDirectory, { withFileTypes: true })) {
      const entryPath = path.join(currentDirectory, entry.name);

      if (entry.isDirectory()) {
        walk(entryPath);
        continue;
      }

      if (!textExtensions.has(path.extname(entry.name))) {
        continue;
      }

      const relativePath = path.relative(root, entryPath);
      const content = fs.readFileSync(entryPath, 'utf8');

      if (viteFirebaseEnv.test(content)) {
        leakedViteEnv.push(relativePath);
      }

      if (entryPath !== firebaseConfigPath && googleApiKey.test(content)) {
        leakedGoogleKeys.push(relativePath);
      }
    }
  }

  walk(directory);
  return { leakedGoogleKeys, leakedViteEnv };
}

if (!fs.existsSync(dist)) {
  fail('dist does not exist. Run npm run build first.');
}

if (process.env.REQUIRE_FIREBASE_CONFIG === '1' && !fs.existsSync(firebaseConfigPath)) {
  fail('dist/firebase-config.json is required for the GitHub Pages deploy artifact.');
}

if (fs.existsSync(firebaseConfigPath)) {
  try {
    require('./validate-firebase-config.cjs')(firebaseConfigPath);
  } catch (error) {
    fail(error.message);
  }
}

const { leakedGoogleKeys, leakedViteEnv } = scan(dist);
if (leakedGoogleKeys.length) {
  fail('Refusing to publish Google API keys outside dist/firebase-config.json:', leakedGoogleKeys);
}

if (leakedViteEnv.length) {
  fail('Refusing to publish Vite Firebase env references:', leakedViteEnv);
}
