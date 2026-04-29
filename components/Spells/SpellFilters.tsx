import React from 'react';
import { CLASS_TRANSLATIONS, LEVEL_NAMES } from '../../services/spellsService';

interface SpellFiltersProps {
    selectedClass: string | null;
    selectedLevel: number | null;
    searchQuery: string;
    onClassChange: (classIndex: string | null) => void;
    onLevelChange: (level: number | null) => void;
    onSearchChange: (query: string) => void;
    isLoading: boolean;
}

const CLASSES = Object.entries(CLASS_TRANSLATIONS).map(([index, name]) => ({
    index,
    name,
})).sort((a, b) => a.name.localeCompare(b.name));

const LEVELS = Object.entries(LEVEL_NAMES).map(([level, name]) => ({
    level: parseInt(level),
    name,
}));

const SpellFilters: React.FC<SpellFiltersProps> = ({
    selectedClass,
    selectedLevel,
    searchQuery,
    onClassChange,
    onLevelChange,
    onSearchChange,
    isLoading,
}) => {
    return (
        <div className="bg-stone-800/50 border border-stone-700 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div>
                    <label className="block text-stone-400 text-xs uppercase tracking-wider mb-2">
                        Buscar Conjuro
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Nombre del conjuro..."
                            disabled={isLoading}
                            className="w-full bg-stone-900/80 border border-stone-600 rounded-lg px-4 py-2 text-stone-200 
                placeholder-stone-500 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/50
                disabled:opacity-50 transition-all"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500">
                            🔍
                        </span>
                    </div>
                </div>

                {/* Class Filter */}
                <div>
                    <label className="block text-stone-400 text-xs uppercase tracking-wider mb-2">
                        Clase
                    </label>
                    <select
                        value={selectedClass || ''}
                        onChange={(e) => onClassChange(e.target.value || null)}
                        disabled={isLoading}
                        className="w-full bg-stone-900/80 border border-stone-600 rounded-lg px-4 py-2 text-stone-200 
              focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/50
              disabled:opacity-50 transition-all appearance-none cursor-pointer"
                    >
                        <option value="">Todas las clases</option>
                        {CLASSES.map(cls => (
                            <option key={cls.index} value={cls.index}>
                                {cls.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Level Filter */}
                <div>
                    <label className="block text-stone-400 text-xs uppercase tracking-wider mb-2">
                        Nivel
                    </label>
                    <select
                        value={selectedLevel ?? ''}
                        onChange={(e) => onLevelChange(e.target.value === '' ? null : parseInt(e.target.value))}
                        disabled={isLoading}
                        className="w-full bg-stone-900/80 border border-stone-600 rounded-lg px-4 py-2 text-stone-200 
              focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/50
              disabled:opacity-50 transition-all appearance-none cursor-pointer"
                    >
                        <option value="">Todos los niveles</option>
                        {LEVELS.map(lvl => (
                            <option key={lvl.level} value={lvl.level}>
                                {lvl.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Active Filters Summary */}
            {(selectedClass || selectedLevel !== null || searchQuery) && (
                <div className="mt-4 pt-3 border-t border-stone-700/50 flex items-center gap-2 flex-wrap">
                    <span className="text-stone-500 text-xs">Filtros activos:</span>

                    {selectedClass && (
                        <button
                            onClick={() => onClassChange(null)}
                            className="px-2 py-1 bg-red-900/40 border border-red-700/50 text-red-300 text-xs rounded-full
                hover:bg-red-800/50 transition-colors flex items-center gap-1"
                        >
                            {CLASS_TRANSLATIONS[selectedClass]}
                            <span className="ml-1">×</span>
                        </button>
                    )}

                    {selectedLevel !== null && (
                        <button
                            onClick={() => onLevelChange(null)}
                            className="px-2 py-1 bg-purple-900/40 border border-purple-700/50 text-purple-300 text-xs rounded-full
                hover:bg-purple-800/50 transition-colors flex items-center gap-1"
                        >
                            {LEVEL_NAMES[selectedLevel]}
                            <span className="ml-1">×</span>
                        </button>
                    )}

                    {searchQuery && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="px-2 py-1 bg-blue-900/40 border border-blue-700/50 text-blue-300 text-xs rounded-full
                hover:bg-blue-800/50 transition-colors flex items-center gap-1"
                        >
                            "{searchQuery}"
                            <span className="ml-1">×</span>
                        </button>
                    )}

                    <button
                        onClick={() => {
                            onClassChange(null);
                            onLevelChange(null);
                            onSearchChange('');
                        }}
                        className="ml-auto text-stone-500 hover:text-stone-300 text-xs underline transition-colors"
                    >
                        Limpiar todo
                    </button>
                </div>
            )}
        </div>
    );
};

export default SpellFilters;
