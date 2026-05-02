import { collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, setDoc, writeBatch } from '@firebase/firestore';
import { requireFirestoreDb } from './firebaseClient.ts';
import { Availability, Player, PlayerId, Schedule } from '../types.ts';

type PlayerDoc = Omit<Player, 'id'> & { id?: PlayerId };
interface ScheduleDoc {
  date: string;
  playerId: PlayerId;
  availability: Availability;
}

const playersCollection = async () => collection(await requireFirestoreDb(), 'players');
const scheduleCollection = async () => collection(await requireFirestoreDb(), 'scheduleEntries');

const mapPlayers = (docs: PlayerDoc[], ids: string[]): Player[] => {
  return docs.map((data, index) => ({
    id: (data.id ?? ids[index]) as PlayerId,
    name: data.name,
    role: data.role,
    color: data.color,
    borderColor: data.borderColor,
    textColor: data.textColor,
    password: data.password,
    imageUrl: data.imageUrl,
  }));
};

const mapSchedule = (docs: ScheduleDoc[]): Schedule => {
  return docs.reduce<Schedule>((acc, row) => {
    if (!acc[row.date]) acc[row.date] = {};
    acc[row.date][row.playerId] = row.availability;
    return acc;
  }, {});
};

export const fetchPlayers = async (): Promise<Player[]> => {
  const playersQuery = query(await playersCollection(), orderBy('id'));
  const snapshot = await getDocs(playersQuery);
  const docs = snapshot.docs.map(doc => doc.data() as PlayerDoc);
  const ids = snapshot.docs.map(doc => doc.id);
  return mapPlayers(docs, ids);
};

export const fetchSchedule = async (): Promise<Schedule> => {
  const snapshot = await getDocs(await scheduleCollection());
  const docs = snapshot.docs.map(doc => doc.data() as ScheduleDoc);
  return mapSchedule(docs);
};

export const upsertAvailability = async (
  dates: string[],
  playerId: PlayerId,
  status: Availability,
): Promise<void> => {
  if (!dates.length) return;
  const dbRef = await requireFirestoreDb();
  const batch = writeBatch(dbRef);
  dates.forEach(date => {
    const ref = doc(dbRef, 'scheduleEntries', `${date}_${playerId}`);
    batch.set(ref, { date, playerId, availability: status });
  });
  await batch.commit();
};

export const removeAvailability = async (dates: string[], playerId: PlayerId): Promise<void> => {
  if (!dates.length) return;
  const dbRef = await requireFirestoreDb();
  const batch = writeBatch(dbRef);
  dates.forEach(date => {
    const ref = doc(dbRef, 'scheduleEntries', `${date}_${playerId}`);
    batch.delete(ref);
  });
  await batch.commit();
};

export const updatePlayer = async (player: Player): Promise<void> => {
  const ref = doc(await playersCollection(), player.id);
  await setDoc(ref, {
    id: player.id,
    name: player.name,
    role: player.role,
    color: player.color,
    borderColor: player.borderColor,
    textColor: player.textColor,
    password: player.password,
    imageUrl: player.imageUrl,
  }, { merge: true });
};

export const subscribeToPlayers = (callback: () => void, onError?: (error: unknown) => void) => {
  let unsubscribe: (() => void) | undefined;
  let isCancelled = false;

  void playersCollection()
    .then(playersRef => {
      if (isCancelled) return;
      unsubscribe = onSnapshot(playersRef, () => { callback(); });
    })
    .catch(error => {
      if (!isCancelled) onError?.(error);
    });

  return () => {
    isCancelled = true;
    unsubscribe?.();
  };
};

export const subscribeToSchedule = (callback: () => void, onError?: (error: unknown) => void) => {
  let unsubscribe: (() => void) | undefined;
  let isCancelled = false;

  void scheduleCollection()
    .then(scheduleRef => {
      if (isCancelled) return;
      unsubscribe = onSnapshot(scheduleRef, () => { callback(); });
    })
    .catch(error => {
      if (!isCancelled) onError?.(error);
    });

  return () => {
    isCancelled = true;
    unsubscribe?.();
  };
};
