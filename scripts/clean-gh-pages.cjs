const fs = require('fs');
const path = require('path');

const GOOGLE_API_KEY = /AIza[0-9A-Za-z_-]{35}/;
const TEXT_EXTENSIONS = new Set(['.html', '.js', '.json', '.css', '.map', '.txt', '.xml']);

function scanForClientSecrets(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      scanForClientSecrets(entryPath);
      continue;
    }

    if (!TEXT_EXTENSIONS.has(path.extname(entry.name))) {
      continue;
    }

    if (GOOGLE_API_KEY.test(fs.readFileSync(entryPath, 'utf8'))) {
      throw new Error(`Refusing to publish Google API key in ${entryPath}`);
    }
  }
}

module.exports = function cleanGhPages(git) {
  fs.rmSync(path.join(git.cwd, 'firebase-config.json'), { force: true });

  for (const entry of fs.readdirSync(git.cwd)) {
    if (!entry.startsWith('.') || entry === '.git' || entry === '.nojekyll') {
      continue;
    }

    fs.rmSync(path.join(git.cwd, entry), { force: true, recursive: true });
  }

  scanForClientSecrets(git.cwd);
};
