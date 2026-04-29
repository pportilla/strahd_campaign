// Spell Preparation Service
// Manages spell builds in localStorage

import { SpellBuild, PreparedSpell } from '../types/spellPreparation';

const STORAGE_KEY = 'strahd-spell-builds';

// Generate a simple UUID
const generateId = (): string => {
    return 'build_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const spellPreparationService = {
    /**
     * Get all saved spell builds from localStorage
     */
    getBuilds(): SpellBuild[] {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return [];
            return JSON.parse(stored) as SpellBuild[];
        } catch (error) {
            console.error('Error loading spell builds:', error);
            return [];
        }
    },

    /**
     * Save all builds to localStorage
     */
    saveBuilds(builds: SpellBuild[]): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(builds));
        } catch (error) {
            console.error('Error saving spell builds:', error);
        }
    },

    /**
     * Create a new spell build
     */
    createBuild(name: string, spells: PreparedSpell[], classFilter?: string): SpellBuild {
        const now = new Date().toISOString();
        const newBuild: SpellBuild = {
            id: generateId(),
            name,
            classFilter,
            spells,
            createdAt: now,
            updatedAt: now,
        };

        const builds = this.getBuilds();
        builds.push(newBuild);
        this.saveBuilds(builds);

        return newBuild;
    },

    /**
     * Update an existing build
     */
    updateBuild(id: string, updates: Partial<Omit<SpellBuild, 'id' | 'createdAt'>>): SpellBuild | null {
        const builds = this.getBuilds();
        const index = builds.findIndex(b => b.id === id);

        if (index === -1) return null;

        builds[index] = {
            ...builds[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        this.saveBuilds(builds);
        return builds[index];
    },

    /**
     * Delete a build by ID
     */
    deleteBuild(id: string): boolean {
        const builds = this.getBuilds();
        const filtered = builds.filter(b => b.id !== id);

        if (filtered.length === builds.length) return false;

        this.saveBuilds(filtered);
        return true;
    },

    /**
     * Get a single build by ID
     */
    getBuild(id: string): SpellBuild | null {
        const builds = this.getBuilds();
        return builds.find(b => b.id === id) || null;
    },
};
