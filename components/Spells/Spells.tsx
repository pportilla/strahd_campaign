import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { spellsService, SpellSummary, SpellDetails } from '../../services/spellsService';
import { SPELL_NAME_TRANSLATIONS } from '../../services/spellTranslations';
import { PreparedSpell, SpellBuild } from '../../types/spellPreparation';
import { spellPreparationService } from '../../services/spellPreparationService';
import SpellFilters from './SpellFilters';
import SpellList from './SpellList';
import SpellCard from './SpellCard';
import SpellPreparationPanel from './SpellPreparationPanel';
import PreparedSpellsView from './PreparedSpellsView';

const Spells: React.FC = () => {
    // State for spells data
    const [allSpells, setAllSpells] = useState<SpellSummary[]>([]);
    const [classSpells, setClassSpells] = useState<SpellSummary[] | null>(null);
    const [filteredSpells, setFilteredSpells] = useState<SpellSummary[]>([]);

    // State for filters
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // State for selected spell details
    const [selectedSpellIndex, setSelectedSpellIndex] = useState<string | null>(null);
    const [selectedSpellDetails, setSelectedSpellDetails] = useState<SpellDetails | null>(null);

    // Loading and error states
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Spell preparation state
    const [preparedSpells, setPreparedSpells] = useState<PreparedSpell[]>([]);
    const [builds, setBuilds] = useState<SpellBuild[]>([]);
    const [currentBuildId, setCurrentBuildId] = useState<string | null>(null);

    // View mode state: null = browse mode, build object = viewing that build
    const [viewingBuild, setViewingBuild] = useState<SpellBuild | null>(null);

    // Load builds on mount
    useEffect(() => {
        setBuilds(spellPreparationService.getBuilds());
    }, []);

    // Create a Set of prepared spell indexes for efficient lookup
    const preparedSpellIndexes = useMemo(
        () => new Set(preparedSpells.map(s => s.index)),
        [preparedSpells]
    );

    // Load all spells on mount
    useEffect(() => {
        const loadSpells = async () => {
            try {
                setIsLoadingList(true);
                setError(null);
                const spells = await spellsService.getAllSpells();
                setAllSpells(spells);
            } catch (err) {
                console.error('Error loading spells:', err);
                setError('Error al conectar con el grimorio de conjuros. Por favor, recarga la página.');
            } finally {
                setIsLoadingList(false);
            }
        };

        loadSpells();
    }, []);

    // Load class-specific spells when class filter changes
    useEffect(() => {
        const loadClassSpells = async () => {
            if (!selectedClass) {
                setClassSpells(null);
                return;
            }

            try {
                setIsLoadingList(true);
                const spells = await spellsService.getSpellsByClass(selectedClass);
                setClassSpells(spells);
            } catch (err) {
                console.error('Error loading class spells:', err);
                // Fall back to filtering from all spells
                setClassSpells(null);
            } finally {
                setIsLoadingList(false);
            }
        };

        loadClassSpells();
    }, [selectedClass]);

    // Apply filters whenever filter state changes
    useEffect(() => {
        let spells = selectedClass && classSpells ? classSpells : allSpells;

        // Filter by level
        spells = spellsService.filterByLevel(spells, selectedLevel);

        // Filter by search query (searches both English and Spanish names)
        spells = spellsService.searchByName(spells, searchQuery, SPELL_NAME_TRANSLATIONS);

        setFilteredSpells(spells);
    }, [allSpells, classSpells, selectedClass, selectedLevel, searchQuery]);

    // Load spell details when a spell is selected
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

    // Spell preparation handlers
    const handleTogglePrepare = useCallback((spell: SpellSummary) => {
        setPreparedSpells(prev => {
            const exists = prev.some(s => s.index === spell.index);
            if (exists) {
                return prev.filter(s => s.index !== spell.index);
            } else {
                const spanishName = SPELL_NAME_TRANSLATIONS[spell.index] || spell.name;
                return [...prev, { index: spell.index, name: spanishName, level: spell.level }];
            }
        });
        // When modifying, clear the current build association
        setCurrentBuildId(null);
    }, []);

    const handleRemoveSpell = useCallback((spellIndex: string) => {
        setPreparedSpells(prev => prev.filter(s => s.index !== spellIndex));
        setCurrentBuildId(null);
    }, []);

    const handleClearAll = useCallback(() => {
        setPreparedSpells([]);
        setCurrentBuildId(null);
    }, []);

    const handleSaveBuild = useCallback((name: string) => {
        const newBuild = spellPreparationService.createBuild(name, preparedSpells, selectedClass || undefined);
        setBuilds(spellPreparationService.getBuilds());
        setCurrentBuildId(newBuild.id);
    }, [preparedSpells, selectedClass]);

    const handleLoadBuild = useCallback((build: SpellBuild) => {
        setPreparedSpells(build.spells);
        setCurrentBuildId(build.id);
    }, []);

    const handleDeleteBuild = useCallback((buildId: string) => {
        spellPreparationService.deleteBuild(buildId);
        setBuilds(spellPreparationService.getBuilds());
        if (currentBuildId === buildId) {
            setCurrentBuildId(null);
        }
        // Close view if we're viewing the deleted build
        if (viewingBuild?.id === buildId) {
            setViewingBuild(null);
        }
    }, [currentBuildId, viewingBuild]);

    // Build view handlers
    const handleViewBuild = useCallback((build: SpellBuild) => {
        setViewingBuild(build);
    }, []);

    const handleCloseBuildView = useCallback(() => {
        setViewingBuild(null);
    }, []);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <span className="text-4xl mb-4">⚠️</span>
                <p className="text-red-400 mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-red-700 hover:bg-red-600 text-stone-100 rounded-lg transition-colors"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    // If viewing a build, show the PreparedSpellsView
    if (viewingBuild) {
        return (
            <div>
                {/* Build Selector Bar (always visible) */}
                <div className="mb-6 bg-gradient-to-r from-purple-950/80 via-stone-900/90 to-stone-900/80 border-2 border-purple-700/60 rounded-xl p-4 shadow-lg shadow-purple-900/20">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">📦</span>
                        <h3 className="font-title text-xl text-purple-300">Builds de Conjuros</h3>
                        <button
                            onClick={handleCloseBuildView}
                            className="ml-auto px-4 py-2 bg-stone-800 border border-stone-600 text-stone-300 rounded-lg hover:text-white hover:bg-stone-700 transition-colors text-sm font-medium"
                        >
                            ← Volver a Conjuros
                        </button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {builds.map(build => (
                            <button
                                key={build.id}
                                onClick={() => handleViewBuild(build)}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 border-2
                                    ${viewingBuild.id === build.id
                                        ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/30 scale-105'
                                        : 'bg-stone-800/80 text-purple-200 border-purple-800/50 hover:bg-purple-900/50 hover:border-purple-600 hover:text-white'
                                    }`}
                            >
                                <span>📜</span>
                                <span>{build.name}</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${viewingBuild.id === build.id ? 'bg-purple-400/30' : 'bg-stone-700'}`}>
                                    {build.spells.length}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <PreparedSpellsView
                    spells={viewingBuild.spells}
                    buildName={viewingBuild.name}
                    onClose={handleCloseBuildView}
                />
            </div>
        );
    }

    return (
        <div>
            {/* Build Selector Bar (if builds exist) */}
            {builds.length > 0 && (
                <div className="mb-6 bg-gradient-to-r from-purple-950/60 via-stone-900/80 to-stone-900/60 border-2 border-purple-800/50 rounded-xl p-4 shadow-lg shadow-purple-900/10">
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2 mr-2">
                            <span className="text-xl">📦</span>
                            <span className="font-title text-lg text-purple-300">Builds:</span>
                        </div>
                        {builds.map(build => (
                            <button
                                key={build.id}
                                onClick={() => handleViewBuild(build)}
                                className="px-4 py-2 bg-purple-900/50 border-2 border-purple-700/60 text-purple-200 rounded-lg hover:bg-purple-700 hover:text-white hover:border-purple-500 hover:shadow-lg hover:shadow-purple-600/20 transition-all duration-200 text-sm font-semibold flex items-center gap-2"
                            >
                                <span>📜</span>
                                <span>{build.name}</span>
                                <span className="text-xs px-1.5 py-0.5 rounded bg-purple-800/50">{build.spells.length}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-6">
                <h2 className="font-title text-3xl text-red-500 mb-2">Grimorio Arcano</h2>
                <p className="text-stone-400">
                    Explora los secretos arcanos de la magia. Usa el botón + para preparar conjuros y guardar builds.
                </p>
            </div>

            {/* Filters */}
            <SpellFilters
                selectedClass={selectedClass}
                selectedLevel={selectedLevel}
                searchQuery={searchQuery}
                onClassChange={setSelectedClass}
                onLevelChange={setSelectedLevel}
                onSearchChange={setSearchQuery}
                isLoading={isLoadingList}
            />

            {/* Main Content - 3 columns on large screens */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Spell List */}
                <div className="bg-stone-800/30 border border-stone-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-stone-300 font-semibold">
                            Conjuros Disponibles
                        </h3>
                        <span className="text-stone-500 text-sm">
                            {filteredSpells.length} {filteredSpells.length === 1 ? 'conjuro' : 'conjuros'}
                        </span>
                    </div>
                    <SpellList
                        spells={filteredSpells}
                        selectedSpell={selectedSpellIndex}
                        onSelectSpell={handleSelectSpell}
                        isLoading={isLoadingList}
                        preparedSpellIndexes={preparedSpellIndexes}
                        onTogglePrepare={handleTogglePrepare}
                    />
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
                            <span className="text-6xl mb-4 opacity-30">📖</span>
                            <p className="text-stone-400">Selecciona un conjuro para ver sus detalles</p>
                            <p className="text-stone-500 text-sm mt-2">
                                Los secretos arcanos te esperan...
                            </p>
                        </div>
                    )}
                </div>

                {/* Preparation Panel */}
                <div className="lg:sticky lg:top-4 lg:self-start">
                    <SpellPreparationPanel
                        preparedSpells={preparedSpells}
                        onRemoveSpell={handleRemoveSpell}
                        onClearAll={handleClearAll}
                        onSaveBuild={handleSaveBuild}
                        builds={builds}
                        currentBuildId={currentBuildId}
                        onLoadBuild={handleLoadBuild}
                        onDeleteBuild={handleDeleteBuild}
                    />
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
      `}</style>
        </div>
    );
};

export default Spells;
