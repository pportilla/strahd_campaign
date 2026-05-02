const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const googleApiKey = /AIza[0-9A-Za-z_-]{35}/;
const textExtensions = new Set(['.html', '.js', '.json', '.css', '.map', '.txt', '.xml']);

function scanForClientSecrets(directory) {
  const findings = [];

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

      if (googleApiKey.test(fs.readFileSync(entryPath, 'utf8'))) {
        findings.push(path.relative(root, entryPath));
      }
    }
  }

  walk(directory);
  return findings;
}

if (!fs.existsSync(dist)) {
  throw new Error('dist does not exist. Run npm run build before preparing gh-pages.');
}

fs.rmSync(path.join(dist, 'firebase-config.json'), { force: true });

const findings = scanForClientSecrets(dist);
if (findings.length) {
  console.error('Refusing to deploy generated files containing Google API keys:');
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}
