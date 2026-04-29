// Spell Preparation Types
// For managing prepared spell packages ("builds")

export interface PreparedSpell {
    index: string;    // Spell index from API (e.g., "fireball")
    name: string;     // Spanish name for display
    level: number;    // Spell level (0-9)
}

export interface SpellBuild {
    id: string;           // Unique identifier (UUID)
    name: string;         // User-defined build name (e.g., "Combate", "Exploración")
    classFilter?: string; // Optional: class this build is for
    spells: PreparedSpell[];
    createdAt: string;    // ISO date string
    updatedAt: string;    // ISO date string
}
