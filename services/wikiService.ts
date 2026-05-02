import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc,
  Timestamp, 
  deleteDoc,
  query,
  orderBy,
  writeBatch
} from '@firebase/firestore';
import { requireFirestoreDb } from './firebaseClient';
import { WikiPage, WikiHistoryEntry, PlayerId, WikiCategory } from '../types';

const WIKI_COLLECTION = 'wiki';

export const wikiService = {
  async getAllPages(): Promise<WikiPage[]> {
    const db = await requireFirestoreDb();
    
    const snapshot = await getDocs(collection(db, WIKI_COLLECTION));
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        category: data.category || 'other'
      } as WikiPage;
    });
  },

  async getPage(slug: string): Promise<WikiPage | null> {
    const db = await requireFirestoreDb();
    
    const docRef = doc(db, WIKI_COLLECTION, slug);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        category: data.category || 'other'
      } as WikiPage;
    }
    return null;
  },

  async getPageHistory(slug: string): Promise<WikiHistoryEntry[]> {
    const db = await requireFirestoreDb();
    
    const historyRef = collection(db, WIKI_COLLECTION, slug, 'history');
    const q = query(historyRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as WikiHistoryEntry));
  },

  async savePage(slug: string, title: string, content: string, category: WikiCategory, playerId: PlayerId): Promise<void> {
    const db = await requireFirestoreDb();
    
    const timestamp = Timestamp.now();
    const docRef = doc(db, WIKI_COLLECTION, slug);
    
    // Check if exists to determine createdBy
    const docSnap = await getDoc(docRef);
    let createdBy = playerId;
    
    if (docSnap.exists()) {
      const existingData = docSnap.data();
      createdBy = existingData.createdBy || existingData.updatedBy || playerId;
    }
    
    const data: Omit<WikiPage, 'id'> = {
      title,
      content,
      category,
      lastUpdated: timestamp,
      updatedBy: playerId,
      createdBy
    };
    
    // Save current version to main document
    await setDoc(docRef, data);

    // Add to history subcollection
    const historyRef = collection(db, WIKI_COLLECTION, slug, 'history');
    await addDoc(historyRef, {
      slug,
      title,
      content,
      category,
      timestamp,
      editorId: playerId
    });
  },

  async deletePage(slug: string): Promise<void> {
    const db = await requireFirestoreDb();
    
    const batch = writeBatch(db);
    
    // 1. Delete all history entries
    const historyRef = collection(db, WIKI_COLLECTION, slug, 'history');
    const historySnapshot = await getDocs(historyRef);
    
    historySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    // 2. Delete the main page document
    const docRef = doc(db, WIKI_COLLECTION, slug);
    batch.delete(docRef);
    
    await batch.commit();
  },

  async renamePage(oldSlug: string, newSlug: string): Promise<void> {
    const db = await requireFirestoreDb();
    
    // 1. Check if new slug already exists
    const newDocRef = doc(db, WIKI_COLLECTION, newSlug);
    const newDocSnap = await getDoc(newDocRef);
    if (newDocSnap.exists()) {
      throw new Error(`La página "${newSlug}" ya existe.`);
    }

    // 2. Get old document data
    const oldDocRef = doc(db, WIKI_COLLECTION, oldSlug);
    const oldDocSnap = await getDoc(oldDocRef);
    if (!oldDocSnap.exists()) {
      throw new Error(`La página original "${oldSlug}" no existe.`);
    }
    const oldData = oldDocSnap.data();

    // 3. Get old history
    const oldHistoryRef = collection(db, WIKI_COLLECTION, oldSlug, 'history');
    const oldHistorySnapshot = await getDocs(oldHistoryRef);

    const batch = writeBatch(db);

    // 4. Create new document with old data
    batch.set(newDocRef, oldData);

    // 5. Copy history to new document
    const newHistoryRef = collection(db, WIKI_COLLECTION, newSlug, 'history');
    oldHistorySnapshot.docs.forEach((historyDoc) => {
      const historyData = historyDoc.data();
      // Update slug in history entry if it was stored there
      const newHistoryDocRef = doc(newHistoryRef, historyDoc.id); // Keep same ID for history entries
      batch.set(newHistoryDocRef, { ...historyData, slug: newSlug });
      
      // Delete old history entry
      batch.delete(historyDoc.ref);
    });

    // 6. Delete old document
    batch.delete(oldDocRef);

    await batch.commit();
  }
};
