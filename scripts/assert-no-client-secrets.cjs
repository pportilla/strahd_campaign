const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const forbidden = [
  {
    label: 'Vite Firebase env reference',
    pattern: /import\.meta\.env\.VITE_FIREBASE_/,
  },
  {
    label: 'Google API key',
    pattern: /AIza[0-9A-Za-z_-]{35}/,
  },
];
const sourceExtensions = new Set(['.cjs', '.html', '.js', '.jsx', '.ts', '.tsx']);
const ignoredDirectories = new Set(['.git', 'dist', 'node_modules']);
const ignoredFiles = new Set([
  path.join(root, 'scripts', 'assert-no-client-secrets.cjs'),
  path.join(root, 'scripts', 'validate-firebase-config.cjs'),
  path.join(root, 'scripts', 'validate-pages-artifact.cjs'),
]);

function* walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        yield* walk(entryPath);
      }
      continue;
    }

    if (sourceExtensions.has(path.extname(entry.name)) && !ignoredFiles.has(entryPath)) {
      yield entryPath;
    }
  }
}

const findings = [];

for (const filePath of walk(root)) {
  const content = fs.readFileSync(filePath, 'utf8');
  for (const rule of forbidden) {
    if (rule.pattern.test(content)) {
      findings.push(`${rule.label}: ${path.relative(root, filePath)}`);
    }
  }
}

if (findings.length) {
  console.error('Refusing to build with client-side secret material:');
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}
