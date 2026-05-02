const fs = require('fs');
const path = require('path');

module.exports = function cleanGhPages(git) {
  for (const entry of fs.readdirSync(git.cwd)) {
    if (!entry.startsWith('.') || entry === '.git' || entry === '.nojekyll') {
      continue;
    }

    fs.rmSync(path.join(git.cwd, entry), { force: true, recursive: true });
  }
};
