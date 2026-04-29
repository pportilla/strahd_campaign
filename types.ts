export type PlayerId = 'dm' | 'bard' | 'wizard' | 'succubus' | 'picaroon' | 'half-elf';

export interface Player {
  id: PlayerId;
  name: string;
  role: string;
  color: string; // Tailwind color class e.g., 'bg-red-500'
  borderColor: string; // e.g., 'border-red-500'
  textColor: string; // e.g., 'text-red-600'
  password: string;
  imageUrl: string;
}

export type Availability = 'available' | 'unavailable' | 'maybe';

export type DaySchedule = Partial<Record<PlayerId, Availability>>;

export type Schedule = Record<string, DaySchedule>; // Key is YYYY-MM-DD

export type WikiCategory = 'pinned' | 'session' | 'other';

export interface WikiPage {
  id: string; // The slug, e.g., 'home', 'strahd', 'barovia'
  title: string;
  content: string;
  category: WikiCategory;
  lastUpdated: any; // We'll handle the conversion from Firestore Timestamp
  updatedBy: PlayerId;
  createdBy?: PlayerId;
}

export interface WikiHistoryEntry {
  id: string;
  slug: string;
  title: string;
  content: string;
  timestamp: any;
  editorId: PlayerId;
}