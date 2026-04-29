// Character Creation Service - D&D 5e
// Uses Spanish API as primary source, with fallback to English API

const API_BASE_SPANISH = 'https://dnd5e.magical20.com/api';
const API_BASE_ENGLISH = 'https://www.dnd5eapi.co/api';

// =============================================================================
// TYPES
// =============================================================================

export interface APIReference {
    index: string;
    name: string;
    url: string;
}

export interface AbilityBonus {
    ability_score: APIReference;
    bonus: number;
}

export interface Choice<T = APIReference> {
    desc: string;
    choose: number;
    type: string;
    from: {
        option_set_type: string;
        options?: Array<{
            option_type: string;
            item?: T;
            count?: number;
            of?: T;
            items?: Array<{ option_type: string; count?: number; of?: T }>;
        }>;
        equipment_category?: APIReference;
    };
}

export interface Race {
    index: string;
    name: string;
    speed: number;
    ability_bonuses: AbilityBonus[];
    age: string;
    alignment: string;
    size: string;
    size_description: string;
    starting_proficiencies: APIReference[];
    languages: APIReference[];
    language_options?: Choice;
    language_desc: string;
    traits: APIReference[];
    subraces: APIReference[];
}

export interface Subrace {
    index: string;
    name: string;
    race: APIReference;
    desc: string;
    ability_bonuses: AbilityBonus[];
    starting_proficiencies: APIReference[];
    languages: APIReference[];
    racial_traits: APIReference[];
}

export interface Trait {
    index: string;
    name: string;
    desc: string[];
    races: APIReference[];
    subraces?: APIReference[];
    proficiencies?: APIReference[];
}

export interface ClassData {
    index: string;
    name: string;
    hit_die: number;
    proficiency_choices: Choice[];
    proficiencies: APIReference[];
    saving_throws: APIReference[];
    starting_equipment: Array<{ equipment: APIReference; quantity: number }>;
    starting_equipment_options: Choice[];
    class_levels: string;
    subclasses: APIReference[];
    spellcasting?: {
        level: number;
        spellcasting_ability: APIReference;
    };
}

export interface ClassLevel {
    level: number;
    ability_score_bonuses: number;
    prof_bonus: number;
    features: APIReference[];
    class_specific?: Record<string, unknown>;
    spellcasting?: {
        cantrips_known?: number;
        spells_known?: number;
        spell_slots_level_1?: number;
        spell_slots_level_2?: number;
        spell_slots_level_3?: number;
        spell_slots_level_4?: number;
        spell_slots_level_5?: number;
        spell_slots_level_6?: number;
        spell_slots_level_7?: number;
        spell_slots_level_8?: number;
        spell_slots_level_9?: number;
    };
}

export interface Feature {
    index: string;
    name: string;
    level: number;
    class: APIReference;
    subclass?: APIReference;
    desc: string[];
    prerequisites?: Array<{
        type: string;
        level?: number;
        feature?: APIReference;
    }>;
}

export interface Equipment {
    index: string;
    name: string;
    equipment_category: APIReference;
    cost: {
        quantity: number;
        unit: string;
    };
    weight?: number;
    desc?: string[];
    // Weapon-specific
    damage?: {
        damage_dice: string;
        damage_type: APIReference;
    };
    range?: {
        normal: number;
        long?: number;
    };
    properties?: APIReference[];
    weapon_category?: string;
    weapon_range?: string;
    // Armor-specific
    armor_category?: string;
    armor_class?: {
        base: number;
        dex_bonus: boolean;
        max_bonus?: number;
    };
    str_minimum?: number;
    stealth_disadvantage?: boolean;
}

export interface EquipmentCategory {
    index: string;
    name: string;
    equipment: APIReference[];
}

export interface Background {
    index: string;
    name: string;
    starting_proficiencies: APIReference[];
    starting_equipment: Array<{ equipment: APIReference; quantity: number }>;
    starting_equipment_options?: Choice[];
    feature: {
        name: string;
        desc: string[];
    };
    personality_traits?: {
        choose: number;
        from: { options: string[] };
    };
    ideals?: {
        choose: number;
        from: { options: Array<{ desc: string; alignments: APIReference[] }> };
    };
    bonds?: {
        choose: number;
        from: { options: string[] };
    };
    flaws?: {
        choose: number;
        from: { options: string[] };
    };
}

export interface AbilityScore {
    index: string;
    name: string;
    full_name: string;
    desc: string[];
    skills: APIReference[];
}

export interface Skill {
    index: string;
    name: string;
    desc: string[];
    ability_score: APIReference;
}

// Character sheet types
export interface CharacterAbilityScores {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
}

export interface CharacterSheet {
    id: string;
    name: string;
    race: string;
    subrace?: string;
    class: string;
    level: number;
    background: string;
    abilityScores: CharacterAbilityScores;
    skillProficiencies: string[];
    equipment: Array<{ index: string; name: string; quantity: number }>;
    hitPoints: number;
    createdAt: string;
    updatedAt: string;
}

// =============================================================================
// CACHE
// =============================================================================

const cache: Map<string, unknown> = new Map();

async function fetchWithCache<T>(url: string, cacheKey: string): Promise<T> {
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey) as T;
    }
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error fetching ${url}`);
    }
    const data = await response.json();
    cache.set(cacheKey, data);
    return data;
}

// =============================================================================
// SERVICE
// =============================================================================

export const characterService = {
    // =========================================================================
    // RACES
    // =========================================================================

    async getAllRaces(): Promise<APIReference[]> {
        const data = await fetchWithCache<{ results: APIReference[] }>(
            `${API_BASE_SPANISH}/races`,
            'races-list'
        );
        return data.results;
    },

    async getRaceDetails(raceIndex: string): Promise<Race> {
        // Try Spanish API first
        try {
            return await fetchWithCache<Race>(
                `${API_BASE_SPANISH}/races/${raceIndex}`,
                `race-${raceIndex}-es`
            );
        } catch {
            return await fetchWithCache<Race>(
                `${API_BASE_ENGLISH}/races/${raceIndex}`,
                `race-${raceIndex}-en`
            );
        }
    },

    async getSubraceDetails(subraceIndex: string): Promise<Subrace> {
        try {
            return await fetchWithCache<Subrace>(
                `${API_BASE_SPANISH}/subraces/${subraceIndex}`,
                `subrace-${subraceIndex}-es`
            );
        } catch {
            return await fetchWithCache<Subrace>(
                `${API_BASE_ENGLISH}/subraces/${subraceIndex}`,
                `subrace-${subraceIndex}-en`
            );
        }
    },

    async getAllSubraces(): Promise<APIReference[]> {
        const data = await fetchWithCache<{ results: APIReference[] }>(
            `${API_BASE_SPANISH}/subraces`,
            'subraces-list'
        );
        return data.results;
    },

    async getTraitDetails(traitIndex: string): Promise<Trait> {
        try {
            return await fetchWithCache<Trait>(
                `${API_BASE_SPANISH}/traits/${traitIndex}`,
                `trait-${traitIndex}-es`
            );
        } catch {
            return await fetchWithCache<Trait>(
                `${API_BASE_ENGLISH}/traits/${traitIndex}`,
                `trait-${traitIndex}-en`
            );
        }
    },

    // =========================================================================
    // CLASSES
    // =========================================================================

    async getAllClasses(): Promise<APIReference[]> {
        const data = await fetchWithCache<{ results: APIReference[] }>(
            `${API_BASE_SPANISH}/classes`,
            'classes-list'
        );
        return data.results;
    },

    async getClassDetails(classIndex: string): Promise<ClassData> {
        try {
            return await fetchWithCache<ClassData>(
                `${API_BASE_SPANISH}/classes/${classIndex}`,
                `class-${classIndex}-es`
            );
        } catch {
            return await fetchWithCache<ClassData>(
                `${API_BASE_ENGLISH}/classes/${classIndex}`,
                `class-${classIndex}-en`
            );
        }
    },

    async getClassLevels(classIndex: string): Promise<ClassLevel[]> {
        try {
            return await fetchWithCache<ClassLevel[]>(
                `${API_BASE_SPANISH}/classes/${classIndex}/levels`,
                `class-levels-${classIndex}-es`
            );
        } catch {
            return await fetchWithCache<ClassLevel[]>(
                `${API_BASE_ENGLISH}/classes/${classIndex}/levels`,
                `class-levels-${classIndex}-en`
            );
        }
    },

    async getFeatureDetails(featureIndex: string): Promise<Feature> {
        try {
            return await fetchWithCache<Feature>(
                `${API_BASE_SPANISH}/features/${featureIndex}`,
                `feature-${featureIndex}-es`
            );
        } catch {
            return await fetchWithCache<Feature>(
                `${API_BASE_ENGLISH}/features/${featureIndex}`,
                `feature-${featureIndex}-en`
            );
        }
    },

    // =========================================================================
    // EQUIPMENT
    // =========================================================================

    async getAllEquipment(): Promise<APIReference[]> {
        const data = await fetchWithCache<{ results: APIReference[] }>(
            `${API_BASE_SPANISH}/equipment`,
            'equipment-list'
        );
        return data.results;
    },

    async getEquipmentDetails(equipmentIndex: string): Promise<Equipment> {
        try {
            return await fetchWithCache<Equipment>(
                `${API_BASE_SPANISH}/equipment/${equipmentIndex}`,
                `equipment-${equipmentIndex}-es`
            );
        } catch {
            return await fetchWithCache<Equipment>(
                `${API_BASE_ENGLISH}/equipment/${equipmentIndex}`,
                `equipment-${equipmentIndex}-en`
            );
        }
    },

    async getEquipmentCategory(categoryIndex: string): Promise<EquipmentCategory> {
        try {
            return await fetchWithCache<EquipmentCategory>(
                `${API_BASE_SPANISH}/equipment-categories/${categoryIndex}`,
                `equipment-category-${categoryIndex}-es`
            );
        } catch {
            return await fetchWithCache<EquipmentCategory>(
                `${API_BASE_ENGLISH}/equipment-categories/${categoryIndex}`,
                `equipment-category-${categoryIndex}-en`
            );
        }
    },

    // =========================================================================
    // BACKGROUNDS
    // =========================================================================

    async getAllBackgrounds(): Promise<APIReference[]> {
        const data = await fetchWithCache<{ results: APIReference[] }>(
            `${API_BASE_SPANISH}/backgrounds`,
            'backgrounds-list'
        );
        return data.results;
    },

    async getBackgroundDetails(backgroundIndex: string): Promise<Background> {
        try {
            return await fetchWithCache<Background>(
                `${API_BASE_SPANISH}/backgrounds/${backgroundIndex}`,
                `background-${backgroundIndex}-es`
            );
        } catch {
            return await fetchWithCache<Background>(
                `${API_BASE_ENGLISH}/backgrounds/${backgroundIndex}`,
                `background-${backgroundIndex}-en`
            );
        }
    },

    // =========================================================================
    // ABILITY SCORES & SKILLS
    // =========================================================================

    async getAllAbilityScores(): Promise<APIReference[]> {
        const data = await fetchWithCache<{ results: APIReference[] }>(
            `${API_BASE_SPANISH}/ability-scores`,
            'ability-scores-list'
        );
        return data.results;
    },

    async getAbilityScoreDetails(abilityIndex: string): Promise<AbilityScore> {
        try {
            return await fetchWithCache<AbilityScore>(
                `${API_BASE_SPANISH}/ability-scores/${abilityIndex}`,
                `ability-score-${abilityIndex}-es`
            );
        } catch {
            return await fetchWithCache<AbilityScore>(
                `${API_BASE_ENGLISH}/ability-scores/${abilityIndex}`,
                `ability-score-${abilityIndex}-en`
            );
        }
    },

    async getAllSkills(): Promise<APIReference[]> {
        const data = await fetchWithCache<{ results: APIReference[] }>(
            `${API_BASE_SPANISH}/skills`,
            'skills-list'
        );
        return data.results;
    },

    async getSkillDetails(skillIndex: string): Promise<Skill> {
        try {
            return await fetchWithCache<Skill>(
                `${API_BASE_SPANISH}/skills/${skillIndex}`,
                `skill-${skillIndex}-es`
            );
        } catch {
            return await fetchWithCache<Skill>(
                `${API_BASE_ENGLISH}/skills/${skillIndex}`,
                `skill-${skillIndex}-en`
            );
        }
    },

    // =========================================================================
    // CHARACTER MANAGEMENT (localStorage)
    // =========================================================================

    saveCharacter(character: CharacterSheet): void {
        const characters = this.getAllCharacters();
        const existingIndex = characters.findIndex(c => c.id === character.id);

        character.updatedAt = new Date().toISOString();

        if (existingIndex >= 0) {
            characters[existingIndex] = character;
        } else {
            character.createdAt = new Date().toISOString();
            characters.push(character);
        }

        localStorage.setItem('strahd-characters', JSON.stringify(characters));
    },

    getAllCharacters(): CharacterSheet[] {
        const stored = localStorage.getItem('strahd-characters');
        return stored ? JSON.parse(stored) : [];
    },

    getCharacter(id: string): CharacterSheet | null {
        const characters = this.getAllCharacters();
        return characters.find(c => c.id === id) || null;
    },

    deleteCharacter(id: string): void {
        const characters = this.getAllCharacters().filter(c => c.id !== id);
        localStorage.setItem('strahd-characters', JSON.stringify(characters));
    },

    // =========================================================================
    // UTILITY FUNCTIONS
    // =========================================================================

    calculateModifier(score: number): number {
        return Math.floor((score - 10) / 2);
    },

    formatModifier(score: number): string {
        const mod = this.calculateModifier(score);
        return mod >= 0 ? `+${mod}` : `${mod}`;
    },

    calculateHitPoints(classHitDie: number, constitutionScore: number, level: number): number {
        const conMod = this.calculateModifier(constitutionScore);
        // First level: max hit die + CON modifier
        // Subsequent levels: average + 1 (rounded down) + CON modifier per level
        const firstLevelHP = classHitDie + conMod;
        const avgHitDie = Math.floor(classHitDie / 2) + 1;
        const subsequentLevelsHP = (level - 1) * (avgHitDie + conMod);
        return Math.max(1, firstLevelHP + subsequentLevelsHP);
    },

    generateId(): string {
        return `char-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },
};
