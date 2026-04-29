import React, { useState } from 'react';
import { PreparedSpell, SpellBuild } from '../../types/spellPreparation';
import { spellsService } from '../../services/spellsService';

interface SpellPreparationPanelProps {
    preparedSpells: PreparedSpell[];
    onRemoveSpell: (spellIndex: string) => void;
    onClearAll: () => void;
    onSaveBuild: (name: string) => void;
    builds: SpellBuild[];
    currentBuildId: string | null;
    onLoadBuild: (build: SpellBuild) => void;
    onDeleteBuild: (buildId: string) => void;
}

// Level badge colors (matching SpellList)
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

const SpellPreparationPanel: React.FC<SpellPreparationPanelProps> = ({
    preparedSpells,
    onRemoveSpell,
    onClearAll,
    onSaveBuild,
    builds,
    currentBuildId,
    onLoadBuild,
    onDeleteBuild,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showBuildsDropdown, setShowBuildsDropdown] = useState(false);
    const [newBuildName, setNewBuildName] = useState('');

    // Group prepared spells by level
    const groupedSpells = preparedSpells.reduce((acc, spell) => {
        if (!acc[spell.level]) acc[spell.level] = [];
        acc[spell.level].push(spell);
        return acc;
    }, {} as Record<number, PreparedSpell[]>);

    const sortedLevels = Object.keys(groupedSpells)
        .map(Number)
        .sort((a, b) => a - b);

    const handleSave = () => {
        if (newBuildName.trim()) {
            onSaveBuild(newBuildName.trim());
            setNewBuildName('');
            setShowSaveModal(false);
        }
    };

    const currentBuild = builds.find(b => b.id === currentBuildId);

    return (
        <div className="bg-stone-800/30 border border-stone-700/50 rounded-lg overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between bg-stone-800/50 hover:bg-stone-800/70 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <span className="text-lg">📜</span>
                    <span className="font-semibold text-stone-200">Conjuros Preparados</span>
                    <span className="text-stone-400 text-sm">({preparedSpells.length})</span>
                </div>
                <span className={`text-stone-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </button>

            {isExpanded && (
                <div className="p-4">
                    {/* Current Build Info */}
                    {currentBuild && (
                        <div className="mb-3 px-3 py-2 bg-purple-900/30 border border-purple-700/50 rounded-lg flex items-center justify-between">
                            <span className="text-purple-300 text-sm">
                                Build activo: <span className="font-medium">{currentBuild.name}</span>
                            </span>
                        </div>
                    )}

                    {/* Builds Dropdown */}
                    <div className="mb-4 relative">
                        <button
                            onClick={() => setShowBuildsDropdown(!showBuildsDropdown)}
                            className="w-full px-3 py-2 bg-stone-900/60 border border-stone-600 rounded-lg text-stone-300 text-left flex items-center justify-between hover:border-stone-500 transition-colors"
                        >
                            <span>📦 Cargar Build...</span>
                            <span className={`text-stone-400 text-xs transition-transform ${showBuildsDropdown ? 'rotate-180' : ''}`}>▼</span>
                        </button>

                        {showBuildsDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-stone-900 border border-stone-600 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
                                {builds.length === 0 ? (
                                    <div className="px-3 py-4 text-stone-500 text-center text-sm">
                                        No hay builds guardados
                                    </div>
                                ) : (
                                    builds.map(build => (
                                        <div
                                            key={build.id}
                                            className={`px-3 py-2 flex items-center justify-between hover:bg-stone-800 group ${build.id === currentBuildId ? 'bg-purple-900/30' : ''}`}
                                        >
                                            <button
                                                onClick={() => {
                                                    onLoadBuild(build);
                                                    setShowBuildsDropdown(false);
                                                }}
                                                className="flex-1 text-left text-stone-300 hover:text-stone-100"
                                            >
                                                <span className="font-medium">{build.name}</span>
                                                <span className="text-stone-500 text-xs ml-2">
                                                    ({build.spells.length} conjuros)
                                                </span>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteBuild(build.id);
                                                }}
                                                className="text-stone-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                                title="Eliminar build"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Prepared Spells List */}
                    {preparedSpells.length === 0 ? (
                        <div className="text-center py-6 text-stone-500">
                            <span className="text-3xl block mb-2">✨</span>
                            <p className="text-sm">Añade conjuros con el botón +</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar mb-4">
                            {sortedLevels.map(level => (
                                <div key={level}>
                                    <div className="text-xs text-stone-500 uppercase tracking-wider mb-1">
                                        {spellsService.getLevelName(level)}
                                    </div>
                                    {groupedSpells[level].map(spell => (
                                        <div
                                            key={spell.index}
                                            className="flex items-center gap-2 px-2 py-1.5 bg-stone-900/50 rounded group"
                                        >
                                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${LEVEL_BADGE_COLORS[spell.level]}`}>
                                                {spell.level === 0 ? '✧' : spell.level}
                                            </span>
                                            <span className="flex-1 text-stone-300 text-sm truncate">
                                                {spell.name}
                                            </span>
                                            <button
                                                onClick={() => onRemoveSpell(spell.index)}
                                                className="text-stone-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Quitar"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowSaveModal(true)}
                            disabled={preparedSpells.length === 0}
                            className="flex-1 px-3 py-2 bg-purple-900/50 border border-purple-700/50 text-purple-300 rounded-lg hover:bg-purple-800/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                        >
                            💾 Guardar Build
                        </button>
                        <button
                            onClick={onClearAll}
                            disabled={preparedSpells.length === 0}
                            className="px-3 py-2 bg-stone-900/50 border border-stone-600 text-stone-400 rounded-lg hover:text-red-400 hover:border-red-700/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                        >
                            Limpiar
                        </button>
                    </div>
                </div>
            )}

            {/* Save Modal */}
            {showSaveModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowSaveModal(false)}>
                    <div className="bg-stone-900 border border-stone-600 rounded-lg p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-stone-200 mb-4">Guardar Build de Conjuros</h3>
                        <input
                            type="text"
                            value={newBuildName}
                            onChange={e => setNewBuildName(e.target.value)}
                            placeholder="Nombre del build (ej: Combate, Exploración)"
                            className="w-full bg-stone-800 border border-stone-600 rounded-lg px-4 py-2 text-stone-200 placeholder-stone-500 focus:outline-none focus:border-purple-500 mb-4"
                            autoFocus
                            onKeyDown={e => e.key === 'Enter' && handleSave()}
                        />
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setShowSaveModal(false)}
                                className="px-4 py-2 text-stone-400 hover:text-stone-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!newBuildName.trim()}
                                className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpellPreparationPanel;
