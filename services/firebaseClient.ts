import { initializeApp } from '@firebase/app';
import { Firestore, getFirestore } from '@firebase/firestore';

interface FirebaseRuntimeConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const CONFIG_URL = './firebase-config.json';
const CONFIG_KEYS: Array<keyof FirebaseRuntimeConfig> = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

let dbPromise: Promise<Firestore | null> | null = null;

const isConfigRecord = (value: unknown): value is Partial<FirebaseRuntimeConfig> => {
  return typeof value === 'object' && value !== null;
};

const normalizeConfig = (value: unknown): FirebaseRuntimeConfig | null => {
  if (!isConfigRecord(value)) return null;

  const config = CONFIG_KEYS.reduce<FirebaseRuntimeConfig>(
    (acc, key) => {
      const rawValue = value[key];
      acc[key] = typeof rawValue === 'string' ? rawValue.trim() : '';
      return acc;
    },
    {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: '',
    },
  );

  return CONFIG_KEYS.every(key => Boolean(config[key])) ? config : null;
};

const loadFirebaseConfig = async (): Promise<FirebaseRuntimeConfig | null> => {
  const response = await fetch(CONFIG_URL, { cache: 'no-store' });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`No se pudo cargar ${CONFIG_URL}: ${response.status}`);
  }

  return normalizeConfig(await response.json());
};

export const getFirestoreDb = async (): Promise<Firestore | null> => {
  if (!dbPromise) {
    dbPromise = loadFirebaseConfig()
      .then(config => {
        if (!config) {
          console.warn('Firebase config is missing. Add public/firebase-config.json for local development.');
          return null;
        }

        const app = initializeApp(config, { automaticDataCollectionEnabled: false });
        return getFirestore(app);
      });
  }

  return dbPromise;
};

export const requireFirestoreDb = async (): Promise<Firestore> => {
  const db = await getFirestoreDb();
  if (!db) {
    throw new Error('Firebase no está configurado. Añade public/firebase-config.json para desarrollo local.');
  }

  return db;
};
