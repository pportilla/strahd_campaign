import { Player, Availability, PlayerId } from './types.ts';

const iconifyIcon = (name: string, color: string) =>
  `https://api.iconify.design/${name}.svg?color=${encodeURIComponent(color)}`;

const emojiIcon = (emoji: string, background = '#0f172a') => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="28" fill="${background}"/><text x="50%" y="50%" font-size="72" text-anchor="middle" dominant-baseline="central">${emoji}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const INITIAL_PLAYERS: Player[] = [
  { id: 'dm', name: 'Dungeon Master', role: 'El Tirano de Barovia', color: 'bg-red-600', borderColor: 'border-red-600', textColor: 'text-red-600', password: 'strahd', imageUrl: iconifyIcon('game-icons:evil-bat', '#dc2626') },
  { id: 'bard', name: 'Silas', role: 'Bardo de los Susurros', color: 'bg-fuchsia-500', borderColor: 'border-fuchsia-500', textColor: 'text-fuchsia-500', password: 'whispers', imageUrl: iconifyIcon('game-icons:lyre', '#d946ef') },
  { id: 'wizard', name: 'Elara', role: 'Escriba Arcana', color: 'bg-cyan-400', borderColor: 'border-cyan-400', textColor: 'text-cyan-400', password: 'arcane', imageUrl: iconifyIcon('game-icons:spell-book', '#22d3ee') },
  { id: 'succubus', name: 'Lilith', role: 'Tentadora', color: 'bg-rose-400', borderColor: 'border-rose-400', textColor: 'text-rose-400', password: 'temptress', imageUrl: iconifyIcon('game-icons:heart-wings', '#fb7185') },
  { id: 'picaroon', name: 'Jax', role: 'Pícaro de las Sombras', color: 'bg-amber-400', borderColor: 'border-amber-400', textColor: 'text-amber-400', password: 'shadows', imageUrl: iconifyIcon('game-icons:stiletto', '#f59e0b') },
  { id: 'half-elf', name: 'Valen', role: 'Semielfo Perdido', color: 'bg-lime-500', borderColor: 'border-lime-500', textColor: 'text-lime-500', password: 'lost', imageUrl: iconifyIcon('game-icons:elf-ear', '#84cc16') },
];

export const PLAYER_IDS = INITIAL_PLAYERS.map(p => p.id);

export const THEME_COLORS: { name: string; color: string; borderColor: string; textColor: string; }[] = [
  // Reds & Oranges
  { name: 'Rojo Sanguíneo', color: 'bg-red-600', borderColor: 'border-red-600', textColor: 'text-red-600' },
  { name: 'Naranja Fuego', color: 'bg-orange-500', borderColor: 'border-orange-500', textColor: 'text-orange-500' },
  { name: 'Ámbar Sombrío', color: 'bg-amber-500', borderColor: 'border-amber-500', textColor: 'text-amber-500' },
  { name: 'Amarillo Solar', color: 'bg-yellow-500', borderColor: 'border-yellow-500', textColor: 'text-yellow-500' },
  
  // Greens
  { name: 'Lima Ácida', color: 'bg-lime-500', borderColor: 'border-lime-500', textColor: 'text-lime-500' },
  { name: 'Verde Bosque', color: 'bg-green-600', borderColor: 'border-green-600', textColor: 'text-green-600' },
  { name: 'Esmeralda Vivo', color: 'bg-emerald-500', borderColor: 'border-emerald-500', textColor: 'text-emerald-500' },
  { name: 'Turquesa Etéreo', color: 'bg-teal-500', borderColor: 'border-teal-500', textColor: 'text-teal-500' },
  
  // Blues & Cyans
  { name: 'Cian Arcano', color: 'bg-cyan-500', borderColor: 'border-cyan-500', textColor: 'text-cyan-500' },
  { name: 'Cielo Claro', color: 'bg-sky-500', borderColor: 'border-sky-500', textColor: 'text-sky-500' },
  { name: 'Azul Profundo', color: 'bg-blue-600', borderColor: 'border-blue-600', textColor: 'text-blue-600' },
  { name: 'Índigo Místico', color: 'bg-indigo-500', borderColor: 'border-indigo-500', textColor: 'text-indigo-500' },
  
  // Purples & Pinks
  { name: 'Violeta Real', color: 'bg-violet-500', borderColor: 'border-violet-500', textColor: 'text-violet-500' },
  { name: 'Púrpura Noble', color: 'bg-purple-500', borderColor: 'border-purple-500', textColor: 'text-purple-500' },
  { name: 'Fucsia Susurrante', color: 'bg-fuchsia-500', borderColor: 'border-fuchsia-500', textColor: 'text-fuchsia-500' },
  { name: 'Rosa Encantado', color: 'bg-pink-500', borderColor: 'border-pink-500', textColor: 'text-pink-500' },
  { name: 'Rosa Tentadora', color: 'bg-rose-500', borderColor: 'border-rose-500', textColor: 'text-rose-500' },
  
  // Grays & Neutrals
  { name: 'Gris de Cripta', color: 'bg-slate-500', borderColor: 'border-slate-500', textColor: 'text-slate-500' },
  { name: 'Gris Niebla', color: 'bg-gray-500', borderColor: 'border-gray-500', textColor: 'text-gray-500' },
  { name: 'Zinc Metálico', color: 'bg-zinc-500', borderColor: 'border-zinc-500', textColor: 'text-zinc-500' },
  { name: 'Sombra Neutra', color: 'bg-neutral-500', borderColor: 'border-neutral-500', textColor: 'text-neutral-500' },
  { name: 'Piedra Antigua', color: 'bg-stone-500', borderColor: 'border-stone-500', textColor: 'text-stone-500' },
];

export interface EmoticonOption {
  name: string;
  imageUrl: string;
}

const COLOR_HEX_LOOKUP: Record<string, string> = {
  'bg-red-600': '#dc2626',
  'bg-orange-500': '#f97316',
  'bg-amber-500': '#f59e0b',
  'bg-yellow-500': '#eab308',
  'bg-lime-500': '#84cc16',
  'bg-green-600': '#16a34a',
  'bg-emerald-500': '#10b981',
  'bg-teal-500': '#14b8a6',
  'bg-cyan-500': '#06b6d4',
  'bg-sky-500': '#0ea5e9',
  'bg-blue-600': '#2563eb',
  'bg-indigo-500': '#6366f1',
  'bg-violet-500': '#8b5cf6',
  'bg-purple-500': '#a855f7',
  'bg-fuchsia-500': '#d946ef',
  'bg-pink-500': '#ec4899',
  'bg-rose-500': '#f43f5e',
  'bg-slate-500': '#64748b',
  'bg-gray-500': '#6b7280',
  'bg-zinc-500': '#71717a',
  'bg-neutral-500': '#737373',
  'bg-stone-500': '#78716c',
  // Legacy support for older selections
  'bg-cyan-400': '#22d3ee',
  'bg-rose-400': '#fb7185',
  'bg-amber-400': '#f59e0b',
};

const bgFromBorder = (borderClass?: string) => {
  if (!borderClass) return undefined;
  if (borderClass.startsWith('border-')) {
    return `bg-${borderClass.slice('border-'.length)}`;
  }
  return undefined;
};

export const getHexFromBgClass = (bgClass?: string): string => {
  if (!bgClass) return '#dc2626';
  return COLOR_HEX_LOOKUP[bgClass] ?? '#dc2626';
};

export const getHexFromBorderClass = (borderClass?: string): string => {
  const derived = bgFromBorder(borderClass);
  return getHexFromBgClass(derived);
};

export const EMOTICON_OPTIONS: EmoticonOption[] = [
  { name: 'Murciélago vampírico', imageUrl: iconifyIcon('game-icons:evil-bat', '#dc2626') },
  { name: 'Lira de los bardos', imageUrl: iconifyIcon('game-icons:lyre', '#d946ef') },
  { name: 'Grimorio arcano', imageUrl: iconifyIcon('game-icons:spell-book', '#22d3ee') },
  { name: 'Alas de súcubo', imageUrl: iconifyIcon('game-icons:heart-wings', '#fb7185') },
  { name: 'Daga sombría', imageUrl: iconifyIcon('game-icons:stiletto', '#f59e0b') },
  { name: 'Oreja élfica', imageUrl: iconifyIcon('game-icons:elf-ear', '#84cc16') },
  { name: 'Rostro de dragón', imageUrl: iconifyIcon('game-icons:dragon-head', '#f97316') },
  { name: 'Explosión ígnea', imageUrl: iconifyIcon('game-icons:fireball', '#fb923c') },
  { name: 'Espada alada', imageUrl: iconifyIcon('game-icons:winged-sword', '#f87171') },
  { name: 'Puño arcano', imageUrl: iconifyIcon('game-icons:magic-palm', '#22d3ee') },
  { name: 'Hechicero espectral', imageUrl: iconifyIcon('game-icons:wizard-staff', '#38bdf8') },
  { name: 'Runa de invocación', imageUrl: iconifyIcon('game-icons:magic-swirl', '#c084fc') },
  { name: 'Hacha bárbara', imageUrl: iconifyIcon('game-icons:barbarian', '#f97316') },
  { name: 'Casco de paladín', imageUrl: iconifyIcon('mdi:shield', '#a5b4fc') },
  { name: 'Portal de mazmorra', imageUrl: iconifyIcon('mdi:castle', '#94a3b8') },
  { name: 'Cráneo encantado', imageUrl: iconifyIcon('game-icons:skull-staff', '#e11d48') },
  { name: 'Pergamino antiguo', imageUrl: iconifyIcon('game-icons:scroll-unfurled', '#fcd34d') },
  { name: 'Armadura bendita', imageUrl: iconifyIcon('game-icons:breastplate', '#cbd5f5') },
  { name: 'Arco largo élfico', imageUrl: iconifyIcon('game-icons:archer', '#4ade80') },
  { name: 'Runa lunar', imageUrl: iconifyIcon('game-icons:moon', '#a78bfa') },
  { name: 'Araña de las criptas', imageUrl: iconifyIcon('game-icons:spider-alt', '#f472b6') },
  { name: 'Garra licántropa', imageUrl: iconifyIcon('game-icons:werewolf', '#fb7185') },
  { name: 'Héroe anónimo', imageUrl: emojiIcon('🧝‍♀️') },
  { name: 'Dados d20', imageUrl: iconifyIcon('mdi:dice-d20', '#fbbf24') },
  { name: 'Espada cruzada', imageUrl: iconifyIcon('mdi:sword-cross', '#ef4444') },
  { name: 'Escudo arcano', imageUrl: iconifyIcon('mdi:shield-sword', '#38bdf8') },
  { name: 'Daga gemela', imageUrl: iconifyIcon('mdi:dagger', '#f97316') },
  { name: 'Calavera vampírica', imageUrl: iconifyIcon('mdi:skull-crossbones', '#f43f5e') },
  { name: 'Llama infernal', imageUrl: emojiIcon('🔥') },
  { name: 'Hechicera', imageUrl: emojiIcon('🧙‍♀️') },
  { name: 'Bardo', imageUrl: emojiIcon('🧝‍♂️') },
  { name: 'Vampiro', imageUrl: emojiIcon('🧛‍♂️') },
  { name: 'Dragón', imageUrl: emojiIcon('🐉') },
  { name: 'Lobo', imageUrl: emojiIcon('🐺') },
  { name: 'Mazo martillo', imageUrl: emojiIcon('⚔️') },
  { name: 'Tormenta arcana', imageUrl: emojiIcon('⚡') },
  { name: 'Pergamino', imageUrl: emojiIcon('📜') },
  { name: 'Poción', imageUrl: emojiIcon('🧪') },
  { name: 'Corona maldita', imageUrl: emojiIcon('👑') },
  { name: 'Dado místico', imageUrl: emojiIcon('🎲') },
  { name: 'Araña', imageUrl: emojiIcon('🕷️') },
  { name: 'Templo lunar', imageUrl: emojiIcon('🌙') },
  { name: 'Castillo gótico', imageUrl: emojiIcon('🏰') },
  { name: 'Vela encantada', imageUrl: emojiIcon('�️') }
];

// Fix: Imported 'Availability' type which was previously missing.
export const AVAILABILITY_ORDER: Availability[] = ['available', 'maybe', 'unavailable'];

export const AVAILABILITY_STYLES: Record<Availability, string> = {
    available: 'bg-green-700 text-stone-100',
    maybe: 'bg-amber-600 text-stone-100',
    unavailable: 'bg-red-800 text-stone-100'
};