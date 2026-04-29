// D&D 5e Spells Service
// Uses English API for complete spell list, with Spanish translations for display
// Fetches Spanish spell details when available, falls back to English

const API_BASE_ENGLISH = 'https://www.dnd5eapi.co/api';
const API_BASE_SPANISH = 'https://dnd5e.magical20.com/api';

// Spanish translations for classes
export const CLASS_TRANSLATIONS: Record<string, string> = {
    bard: 'Bardo',
    cleric: 'Clérigo',
    druid: 'Druida',
    paladin: 'Paladín',
    ranger: 'Explorador',
    sorcerer: 'Hechicero',
    warlock: 'Brujo',
    wizard: 'Mago',
};

// Reverse mapping for API calls
export const CLASS_INDEX_FROM_SPANISH: Record<string, string> = {
    'Bardo': 'bard',
    'Clérigo': 'cleric',
    'Druida': 'druid',
    'Paladín': 'paladin',
    'Explorador': 'ranger',
    'Hechicero': 'sorcerer',
    'Brujo': 'warlock',
    'Mago': 'wizard',
};

// Spanish translations for magic schools
export const SCHOOL_TRANSLATIONS: Record<string, string> = {
    abjuration: 'Abjuración',
    conjuration: 'Conjuración',
    divination: 'Adivinación',
    enchantment: 'Encantamiento',
    evocation: 'Evocación',
    illusion: 'Ilusión',
    necromancy: 'Nigromancia',
    transmutation: 'Transmutación',
};

// Spanish level names
export const LEVEL_NAMES: Record<number, string> = {
    0: 'Truco',
    1: '1º nivel',
    2: '2º nivel',
    3: '3º nivel',
    4: '4º nivel',
    5: '5º nivel',
    6: '6º nivel',
    7: '7º nivel',
    8: '8º nivel',
    9: '9º nivel',
};

// Component descriptions
export const COMPONENT_DESCRIPTIONS: Record<string, string> = {
    V: 'Verbal',
    S: 'Somático',
    M: 'Material',
};

export interface SpellSummary {
    index: string;
    name: string;
    level: number;
    url: string;
}

export interface SpellDetails {
    index: string;
    name: string;
    desc: string[];
    higher_level?: string[];
    range: string;
    components: string[];
    material?: string;
    ritual: boolean;
    duration: string;
    concentration: boolean;
    casting_time: string;
    level: number;
    damage?: {
        damage_type?: {
            index: string;
            name: string;
        };
        damage_at_slot_level?: Record<string, string>;
    };
    dc?: {
        dc_type: {
            index: string;
            name: string;
        };
        dc_success: string;
    };
    area_of_effect?: {
        type: string;
        size: number;
    };
    school: {
        index: string;
        name: string;
    };
    classes: Array<{
        index: string;
        name: string;
    }>;
    subclasses?: Array<{
        index: string;
        name: string;
    }>;
}

interface SpellListResponse {
    count: number;
    results: SpellSummary[];
}

// Cache for spell details to avoid repeated API calls
const spellDetailsCache: Map<string, SpellDetails> = new Map();

export const spellsService = {
    /**
     * Get all spells from the English API (complete with levels)
     */
    async getAllSpells(): Promise<SpellSummary[]> {
        const response = await fetch(`${API_BASE_ENGLISH}/spells`);
        if (!response.ok) {
            throw new Error('Error al cargar los conjuros');
        }
        const data: SpellListResponse = await response.json();
        return data.results;
    },

    /**
     * Get spells for a specific class from the English API
     */
    async getSpellsByClass(classIndex: string): Promise<SpellSummary[]> {
        const response = await fetch(`${API_BASE_ENGLISH}/classes/${classIndex}/spells`);
        if (!response.ok) {
            throw new Error(`Error al cargar conjuros para ${classIndex}`);
        }
        const data: SpellListResponse = await response.json();
        return data.results;
    },

    /**
     * Get detailed information about a specific spell
     * Tries Spanish API first, falls back to English
     */
    async getSpellDetails(spellIndex: string): Promise<SpellDetails> {
        // Check cache first
        if (spellDetailsCache.has(spellIndex)) {
            return spellDetailsCache.get(spellIndex)!;
        }

        // Try Spanish API first
        try {
            const spanishResponse = await fetch(`${API_BASE_SPANISH}/spells/${spellIndex}`);
            if (spanishResponse.ok) {
                const data: SpellDetails = await spanishResponse.json();
                // Verify it has Spanish content (check if desc exists and is not empty)
                if (data.desc && data.desc.length > 0) {
                    spellDetailsCache.set(spellIndex, data);
                    return data;
                }
            }
        } catch (e) {
            console.warn(`Spanish API failed for ${spellIndex}, trying English API`);
        }

        // Fallback to English API
        const response = await fetch(`${API_BASE_ENGLISH}/spells/${spellIndex}`);
        if (!response.ok) {
            throw new Error(`Error al cargar el conjuro ${spellIndex}`);
        }
        const data: SpellDetails = await response.json();
        spellDetailsCache.set(spellIndex, data);
        return data;
    },

    /**
     * Get spells filtered by level
     */
    filterByLevel(spells: SpellSummary[], level: number | null): SpellSummary[] {
        if (level === null) return spells;
        return spells.filter(spell => spell.level === level);
    },

    /**
     * Search spells by name (English name, but we display Spanish translations)
     */
    searchByName(spells: SpellSummary[], query: string, translations: Record<string, string>): SpellSummary[] {
        if (!query.trim()) return spells;
        const lowerQuery = query.toLowerCase();
        return spells.filter(spell => {
            const englishName = spell.name.toLowerCase();
            const spanishName = (translations[spell.index] || '').toLowerCase();
            return englishName.includes(lowerQuery) || spanishName.includes(lowerQuery);
        });
    },

    /**
     * Translate a class index to Spanish
     */
    translateClass(classIndex: string): string {
        return CLASS_TRANSLATIONS[classIndex] || classIndex;
    },

    /**
     * Translate a school index to Spanish
     */
    translateSchool(schoolIndex: string): string {
        return SCHOOL_TRANSLATIONS[schoolIndex] || schoolIndex;
    },

    /**
     * Get level name in Spanish
     */
    getLevelName(level: number): string {
        return LEVEL_NAMES[level] || `${level}º nivel`;
    },
};
