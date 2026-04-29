import React from 'react';
import { SpellSummary, spellsService } from '../../services/spellsService';
import { SPELL_NAME_TRANSLATIONS } from '../../services/spellTranslations';

interface SpellListProps {
    spells: SpellSummary[];
    selectedSpell: string | null;
    onSelectSpell: (index: string) => void;
    isLoading: boolean;
    // Preparation mode props
    preparedSpellIndexes?: Set<string>;
    onTogglePrepare?: (spell: SpellSummary) => void;
}

// Level badge colors
const LEVEL_BADGE_COLORS: Record<number, string> = {
    0: 'bg-stone-700 text-stone-300',
    1: 'bg-blue-900/70 text-blue-300',
    2: 'bg-green-900/70 text-green-300',
    3: 'bg-yellow-900/70 text-yellow-300',
    4: 'bg-orange-900/70 text-orange-300',
    5: 'bg-red-900/70 text-red-300',
    6: 'bg-purple-900/70 text-purple-300',
    7: 'bg-pink-900/70 text-pink-300',
    8: 'bg-cyan-900/70 text-cyan-300',
    9: 'bg-amber-900/70 text-amber-300',
};

// Helper function to get Spanish name
const getSpanishName = (spell: SpellSummary): string => {
    return SPELL_NAME_TRANSLATIONS[spell.index] || spell.name;
};

const SpellList: React.FC<SpellListProps> = ({
    spells,
    selectedSpell,
    onSelectSpell,
    isLoading,
    preparedSpellIndexes = new Set(),
    onTogglePrepare,
}) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-stone-400 animate-pulse">
                    <span className="text-2xl">✧</span>
                    <span className="ml-2">Invocando conjuros...</span>
                </div>
            </div>
        );
    }

    if (spells.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <span className="text-4xl mb-3 opacity-50">📜</span>
                <p className="text-stone-400">No se encontraron conjuros</p>
                <p className="text-stone-500 text-sm mt-1">Prueba con otros filtros</p>
            </div>
        );
    }

    // Group spells by level for better organization
    const groupedSpells = spells.reduce((acc, spell) => {
        const level = spell.level;
        if (!acc[level]) acc[level] = [];
        acc[level].push(spell);
        return acc;
    }, {} as Record<number, SpellSummary[]>);

    const sortedLevels = Object.keys(groupedSpells)
        .map(Number)
        .sort((a, b) => a - b);

    return (
        <div className="h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {sortedLevels.map(level => (
                <div key={level} className="mb-4">
                    <div className="sticky top-0 bg-stone-900/95 backdrop-blur-sm py-2 z-10 border-b border-stone-700/50 mb-2">
                        <span className={`text-xs uppercase tracking-wider font-semibold ${LEVEL_BADGE_COLORS[level]?.replace('bg-', 'text-').replace('/70', '') || 'text-stone-400'}`}>
                            {spellsService.getLevelName(level)} ({groupedSpells[level].length})
                        </span>
                    </div>
                    <div className="space-y-1">
                        {groupedSpells[level]
                            .sort((a, b) => getSpanishName(a).localeCompare(getSpanishName(b), 'es'))
                            .map(spell => {
                                const spanishName = getSpanishName(spell);
                                const isTranslated = SPELL_NAME_TRANSLATIONS[spell.index] !== undefined;
                                const isPrepared = preparedSpellIndexes.has(spell.index);

                                return (
                                    <div
                                        key={spell.index}
                                        className={`flex items-center gap-1 rounded-lg transition-all duration-200
                                            ${isPrepared ? 'bg-purple-900/30 border border-purple-700/40' : ''}
                                            ${selectedSpell === spell.index && !isPrepared ? 'bg-red-900/40 border border-red-700/50' : ''}
                                            ${selectedSpell !== spell.index && !isPrepared ? 'bg-stone-800/30 hover:bg-stone-800/60 border border-transparent hover:border-stone-600/50' : ''}
                                        `}
                                    >
                                        {/* Prepare toggle button */}
                                        {onTogglePrepare && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onTogglePrepare(spell);
                                                }}
                                                className={`w-8 h-8 flex items-center justify-center shrink-0 rounded-l-lg transition-colors
                                                    ${isPrepared
                                                        ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-800/50'
                                                        : 'text-stone-500 hover:text-green-400 hover:bg-stone-700/50'
                                                    }`}
                                                title={isPrepared ? 'Quitar de preparados' : 'Añadir a preparados'}
                                            >
                                                {isPrepared ? '✓' : '+'}
                                            </button>
                                        )}

                                        {/* Spell button */}
                                        <button
                                            onClick={() => onSelectSpell(spell.index)}
                                            className={`flex-1 text-left px-2 py-2 flex items-center gap-3 group
                                                ${selectedSpell === spell.index ? 'text-red-200' : isPrepared ? 'text-purple-200' : 'text-stone-300'}
                                            `}
                                        >
                                            <span
                                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                                                    ${LEVEL_BADGE_COLORS[spell.level] || 'bg-stone-700 text-stone-300'}`}
                                            >
                                                {spell.level === 0 ? '✧' : spell.level}
                                            </span>
                                            <div className="flex flex-col min-w-0">
                                                <span className="truncate group-hover:text-stone-100 transition-colors">
                                                    {spanishName}
                                                </span>
                                                {isTranslated && (
                                                    <span className="text-stone-500 text-xs truncate">
                                                        {spell.name}
                                                    </span>
                                                )}
                                            </div>
                                            {isPrepared && (
                                                <span className="ml-auto text-purple-400 text-xs">★</span>
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SpellList;
