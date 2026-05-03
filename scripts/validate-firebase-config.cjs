const fs = require('fs');
const path = require('path');

const requiredKeys = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];
const googleApiKey = /^AIza[0-9A-Za-z_-]{35}$/;

function fail(message) {
  throw new Error(message);
}

function validateFirebaseConfig(configFilePath) {
  const configPath = path.resolve(configFilePath);

  if (!fs.existsSync(configPath)) {
    fail(`Missing Firebase runtime config: ${configPath}`);
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    fail(`Invalid Firebase runtime config JSON in ${configPath}: ${error.message}`);
  }

  if (typeof config !== 'object' || config === null || Array.isArray(config)) {
    fail(`Firebase runtime config must be a JSON object: ${configPath}`);
  }

  const missingKeys = requiredKeys.filter(key => typeof config[key] !== 'string' || !config[key].trim());
  if (missingKeys.length) {
    fail(`Firebase runtime config is missing required values: ${missingKeys.join(', ')}`);
  }

  if (!googleApiKey.test(config.apiKey)) {
    fail('Firebase runtime config apiKey does not look like a Google API key.');
  }
}

module.exports = validateFirebaseConfig;

if (require.main === module) {
  try {
    validateFirebaseConfig(process.argv[2] || 'public/firebase-config.json');
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
