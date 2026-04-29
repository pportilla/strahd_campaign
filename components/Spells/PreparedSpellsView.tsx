import React, { useState, useEffect, useCallback } from 'react';
import { PreparedSpell } from '../../types/spellPreparation';
import { spellsService, SpellDetails } from '../../services/spellsService';
import SpellCard from './SpellCard';

interface PreparedSpellsViewProps {
    spells: PreparedSpell[];
    buildName: string;
    onClose: () => void;
}

// Level badge colors
const LEVEL_COLORS: Record<number, { bg: string; text: string; border: string; active: string }> = {
    0: { bg: 'bg-stone-800', text: 'text-stone-300', border: 'border-stone-600', active: 'bg-stone-700' },
    1: { bg: 'bg-blue-900/50', text: 'text-blue-300', border: 'border-blue-700', active: 'bg-blue-800/70' },
    2: { bg: 'bg-green-900/50', text: 'text-green-300', border: 'border-green-700', active: 'bg-green-800/70' },
    3: { bg: 'bg-yellow-900/50', text: 'text-yellow-300', border: 'border-yellow-700', active: 'bg-yellow-800/70' },
    4: { bg: 'bg-orange-900/50', text: 'text-orange-300', border: 'border-orange-700', active: 'bg-orange-800/70' },
    5: { bg: 'bg-red-900/50', text: 'text-red-300', border: 'border-red-700', active: 'bg-red-800/70' },
    6: { bg: 'bg-purple-900/50', text: 'text-purple-300', border: 'border-purple-700', active: 'bg-purple-800/70' },
    7: { bg: 'bg-pink-900/50', text: 'text-pink-300', border: 'border-pink-700', active: 'bg-pink-800/70' },
    8: { bg: 'bg-cyan-900/50', text: 'text-cyan-300', border: 'border-cyan-700', active: 'bg-cyan-800/70' },
    9: { bg: 'bg-amber-900/50', text: 'text-amber-300', border: 'border-amber-700', active: 'bg-amber-800/70' },
};

const PreparedSpellsView: React.FC<PreparedSpellsViewProps> = ({
    spells,
    buildName,
    onClose,
}) => {
    // Group spells by level
    const groupedSpells = spells.reduce((acc, spell) => {
        if (!acc[spell.level]) acc[spell.level] = [];
        acc[spell.level].push(spell);
        return acc;
    }, {} as Record<number, PreparedSpell[]>);

    const sortedLevels = Object.keys(groupedSpells)
        .map(Number)
        .sort((a, b) => a - b);

    // State for active level tab and selected spell
    const [activeLevel, setActiveLevel] = useState<number>(sortedLevels[0] ?? 0);
    const [selectedSpellIndex, setSelectedSpellIndex] = useState<string | null>(null);
    const [selectedSpellDetails, setSelectedSpellDetails] = useState<SpellDetails | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    // Reset active level when spells change
    useEffect(() => {
        if (sortedLevels.length > 0 && !sortedLevels.includes(activeLevel)) {
            setActiveLevel(sortedLevels[0]);
        }
    }, [sortedLevels, activeLevel]);

    // Load spell details
    const handleSelectSpell = useCallback(async (spellIndex: string) => {
        setSelectedSpellIndex(spellIndex);
        setIsLoadingDetails(true);

        try {
            const details = await spellsService.getSpellDetails(spellIndex);
            setSelectedSpellDetails(details);
        } catch (err) {
            console.error('Error loading spell details:', err);
            setSelectedSpellDetails(null);
        } finally {
            setIsLoadingDetails(false);
        }
    }, []);

    const handleCloseSpellCard = useCallback(() => {
        setSelectedSpellIndex(null);
        setSelectedSpellDetails(null);
    }, []);

    const currentLevelSpells = groupedSpells[activeLevel] || [];

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="text-stone-400 hover:text-stone-200 transition-colors p-2 rounded-lg hover:bg-stone-800"
                        title="Volver al grimorio"
                    >
                        ← Volver
                    </button>
                    <div>
                        <h2 className="font-title text-2xl text-purple-400">
                            📜 {buildName}
                        </h2>
                        <p className="text-stone-500 text-sm">
                            {spells.length} {spells.length === 1 ? 'conjuro preparado' : 'conjuros preparados'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Level Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-stone-700 pb-4">
                {sortedLevels.map(level => {
                    const colors = LEVEL_COLORS[level] || LEVEL_COLORS[0];
                    const isActive = activeLevel === level;
                    const count = groupedSpells[level].length;

                    return (
                        <button
                            key={level}
                            onClick={() => setActiveLevel(level)}
                            className={`px-4 py-2 rounded-lg border transition-all duration-200 flex items-center gap-2
                                ${isActive
                                    ? `${colors.active} ${colors.border} ${colors.text} shadow-lg`
                                    : `${colors.bg} border-transparent ${colors.text} opacity-70 hover:opacity-100`
                                }`}
                        >
                            <span className="font-semibold">
                                {spellsService.getLevelName(level)}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-xs ${isActive ? 'bg-black/30' : 'bg-black/20'}`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Spells in current level */}
                <div className="bg-stone-800/30 border border-stone-700/50 rounded-lg p-4">
                    <h3 className="text-stone-300 font-semibold mb-4 flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${LEVEL_COLORS[activeLevel]?.bg} ${LEVEL_COLORS[activeLevel]?.text}`}>
                            {activeLevel === 0 ? '✧' : activeLevel}
                        </span>
                        {spellsService.getLevelName(activeLevel)}
                    </h3>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {currentLevelSpells
                            .sort((a, b) => a.name.localeCompare(b.name, 'es'))
                            .map(spell => (
                                <button
                                    key={spell.index}
                                    onClick={() => handleSelectSpell(spell.index)}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 group
                                        ${selectedSpellIndex === spell.index
                                            ? `${LEVEL_COLORS[activeLevel]?.active} border ${LEVEL_COLORS[activeLevel]?.border} ${LEVEL_COLORS[activeLevel]?.text}`
                                            : 'bg-stone-900/50 hover:bg-stone-800/70 border border-transparent hover:border-stone-600/50 text-stone-300'
                                        }`}
                                >
                                    <span className="text-lg">✦</span>
                                    <span className="font-medium group-hover:text-stone-100 transition-colors">
                                        {spell.name}
                                    </span>
                                </button>
                            ))}
                    </div>
                </div>

                {/* Spell Details */}
                <div className="lg:sticky lg:top-4 lg:self-start">
                    {isLoadingDetails ? (
                        <div className="bg-stone-800/30 border border-stone-700/50 rounded-lg p-8 flex items-center justify-center h-64">
                            <div className="text-stone-400 animate-pulse flex items-center gap-2">
                                <span className="text-2xl">✧</span>
                                <span>Descifrando el conjuro...</span>
                            </div>
                        </div>
                    ) : selectedSpellDetails ? (
                        <SpellCard spell={selectedSpellDetails} onClose={handleCloseSpellCard} />
                    ) : (
                        <div className="bg-stone-800/30 border border-stone-700/50 rounded-lg p-8 flex flex-col items-center justify-center h-64 text-center">
                            <span className="text-6xl mb-4 opacity-30">✨</span>
                            <p className="text-stone-400">Selecciona un conjuro para ver sus detalles</p>
                            <p className="text-stone-500 text-sm mt-2">
                                Haz clic en cualquier conjuro de la lista
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom scrollbar styles */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(41, 37, 36, 0.5);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(120, 113, 108, 0.5);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(120, 113, 108, 0.8);
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default PreparedSpellsView;
