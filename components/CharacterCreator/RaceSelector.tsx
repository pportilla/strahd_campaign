import React, { useState, useEffect, useCallback } from 'react';
import { characterService, Race, Subrace, CharacterAbilityScores, APIReference } from '../../services/characterService';
import {
    RACE_TRANSLATIONS,
    SUBRACE_TRANSLATIONS,
    RACE_ICONS,
    ABILITY_TRANSLATIONS,
    DRAGON_ANCESTRIES,
    SIZE_TRANSLATIONS,
    LANGUAGE_TRANSLATIONS,
    getTraitInfo,
    UI_LABELS,
} from '../../services/characterTranslations';
import Tooltip from './Tooltip';

interface RaceSelectorProps {
    selectedRace: string;
    selectedSubrace: string;
    selectedDragonAncestry?: string;
    onRaceChange: (
        race: string,
        subrace: string,
        bonuses: Partial<CharacterAbilityScores>,
        languages: string[],
        dragonAncestry?: string
    ) => void;
}

const RaceSelector: React.FC<RaceSelectorProps> = ({
    selectedRace,
    selectedSubrace,
    selectedDragonAncestry,
    onRaceChange,
}) => {
    const [races, setRaces] = useState<APIReference[]>([]);
    const [raceDetails, setRaceDetails] = useState<Race | null>(null);
    const [subraceDetails, setSubraceDetails] = useState<Subrace | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragonAncestry, setDragonAncestry] = useState<string>(selectedDragonAncestry || '');

    // Load races on mount
    useEffect(() => {
        const loadRaces = async () => {
            try {
                setIsLoading(true);
                const raceList = await characterService.getAllRaces();
                setRaces(raceList);
            } catch (err) {
                console.error('Error loading races:', err);
                setError(UI_LABELS.errorLoading);
            } finally {
                setIsLoading(false);
            }
        };
        loadRaces();
    }, []);

    // Load race details when selection changes
    useEffect(() => {
        if (!selectedRace) {
            setRaceDetails(null);
            return;
        }

        const loadRaceDetails = async () => {
            try {
                setIsLoadingDetails(true);
                const details = await characterService.getRaceDetails(selectedRace);
                setRaceDetails(details);
            } catch (err) {
                console.error('Error loading race details:', err);
            } finally {
                setIsLoadingDetails(false);
            }
        };
        loadRaceDetails();
    }, [selectedRace]);

    // Load subrace details when selection changes
    useEffect(() => {
        if (!selectedSubrace) {
            setSubraceDetails(null);
            return;
        }

        const loadSubraceDetails = async () => {
            try {
                const details = await characterService.getSubraceDetails(selectedSubrace);
                setSubraceDetails(details);
            } catch (err) {
                console.error('Error loading subrace details:', err);
            }
        };
        loadSubraceDetails();
    }, [selectedSubrace]);

    // Calculate ability bonuses and update parent
    const updateBonuses = useCallback(() => {
        const bonuses: Partial<CharacterAbilityScores> = {};

        // Race bonuses
        if (raceDetails) {
            raceDetails.ability_bonuses.forEach(ab => {
                const key = ab.ability_score.index as keyof CharacterAbilityScores;
                bonuses[key] = (bonuses[key] || 0) + ab.bonus;
            });
        }

        // Subrace bonuses
        if (subraceDetails) {
            subraceDetails.ability_bonuses.forEach(ab => {
                const key = ab.ability_score.index as keyof CharacterAbilityScores;
                bonuses[key] = (bonuses[key] || 0) + ab.bonus;
            });
        }

        // Languages from race
        const languages = raceDetails?.languages.map(l => l.index) || [];

        onRaceChange(selectedRace, selectedSubrace, bonuses, languages, dragonAncestry);
    }, [raceDetails, subraceDetails, selectedRace, selectedSubrace, dragonAncestry, onRaceChange]);

    useEffect(() => {
        if (selectedRace) {
            updateBonuses();
        }
    }, [raceDetails, subraceDetails, dragonAncestry, updateBonuses, selectedRace]);

    // Handle race selection
    const handleRaceClick = useCallback((raceIndex: string) => {
        if (raceIndex !== selectedRace) {
            // Reset subrace when race changes
            onRaceChange(raceIndex, '', {}, [], undefined);
            setDragonAncestry('');
        }
    }, [selectedRace, onRaceChange]);

    // Handle subrace selection
    const handleSubraceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSubrace = e.target.value;
        onRaceChange(selectedRace, newSubrace, {}, [], dragonAncestry);
    }, [selectedRace, dragonAncestry, onRaceChange]);

    // Handle dragon ancestry selection
    const handleDragonAncestryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const newAncestry = e.target.value;
        setDragonAncestry(newAncestry);
    }, []);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <span className="text-4xl mb-4">⚠️</span>
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    return (
        <div>
            <h3 className="font-title text-2xl text-red-400 mb-4">Elige tu Raza</h3>
            <p className="text-stone-400 mb-6">
                Tu raza determina tus rasgos físicos, habilidades innatas y cultura de origen.
            </p>

            {isLoading ? (
                <div className="flex items-center justify-center h-32 text-stone-400">
                    <span className="animate-pulse">{UI_LABELS.loadingRaces}</span>
                </div>
            ) : (
                <>
                    {/* Race grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                        {races.map(race => {
                            const isSelected = selectedRace === race.index;
                            const icon = RACE_ICONS[race.index] || '👤';
                            const translatedName = RACE_TRANSLATIONS[race.index] || race.name;

                            return (
                                <button
                                    key={race.index}
                                    onClick={() => handleRaceClick(race.index)}
                                    className={`p-4 rounded-lg border transition-all flex flex-col items-center gap-2 ${isSelected
                                        ? 'bg-red-900/40 border-red-500/50 text-red-300 shadow-lg shadow-red-900/20'
                                        : 'bg-stone-900/50 border-stone-600/30 text-stone-300 hover:bg-stone-800/50 hover:border-stone-500/50'
                                        }`}
                                >
                                    <span className="text-3xl">{icon}</span>
                                    <span className="text-sm font-medium">{translatedName}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Race details */}
                    {isLoadingDetails ? (
                        <div className="bg-stone-900/50 border border-stone-600/30 rounded-lg p-4 text-center text-stone-400">
                            <span className="animate-pulse">Cargando detalles...</span>
                        </div>
                    ) : raceDetails && (
                        <div className="bg-stone-900/50 border border-stone-600/30 rounded-lg p-4">
                            {/* Race header */}
                            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-stone-700/50">
                                <span className="text-4xl">{RACE_ICONS[selectedRace] || '👤'}</span>
                                <div>
                                    <h4 className="text-xl font-semibold text-stone-200">
                                        {RACE_TRANSLATIONS[selectedRace] || raceDetails.name}
                                    </h4>
                                    <p className="text-stone-400 text-sm">
                                        Velocidad: {raceDetails.speed} pies • Tamaño: {SIZE_TRANSLATIONS[raceDetails.size] || raceDetails.size}
                                    </p>
                                </div>
                            </div>

                            {/* Ability bonuses */}
                            <div className="mb-4">
                                <h5 className="text-sm font-semibold text-stone-400 mb-2">Bonificadores de Característica</h5>
                                <div className="flex flex-wrap gap-2">
                                    {raceDetails.ability_bonuses.map(ab => (
                                        <span key={ab.ability_score.index} className="px-3 py-1 bg-stone-800/50 rounded-full text-sm">
                                            <span className="text-stone-300">
                                                {ABILITY_TRANSLATIONS[ab.ability_score.index]?.full || ab.ability_score.name}
                                            </span>
                                            <span className="text-green-400 ml-1">+{ab.bonus}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Subrace selection */}
                            {raceDetails.subraces.length > 0 && (
                                <div className="mb-4">
                                    <h5 className="text-sm font-semibold text-stone-400 mb-2">Subraza</h5>
                                    <select
                                        value={selectedSubrace}
                                        onChange={handleSubraceChange}
                                        className="w-full px-4 py-2 bg-stone-800/50 border border-stone-600/30 rounded-lg text-stone-200 focus:border-red-500/50 focus:outline-none"
                                    >
                                        <option value="">{UI_LABELS.selectSubrace}</option>
                                        {raceDetails.subraces.map(sr => (
                                            <option key={sr.index} value={sr.index}>
                                                {SUBRACE_TRANSLATIONS[sr.index] || sr.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Subrace bonuses */}
                            {subraceDetails && subraceDetails.ability_bonuses.length > 0 && (
                                <div className="mb-4 p-3 bg-stone-800/30 rounded-lg">
                                    <h5 className="text-sm font-semibold text-stone-400 mb-2">
                                        Bonificadores de {SUBRACE_TRANSLATIONS[selectedSubrace] || subraceDetails.name}
                                    </h5>
                                    <div className="flex flex-wrap gap-2">
                                        {subraceDetails.ability_bonuses.map(ab => (
                                            <span key={ab.ability_score.index} className="px-3 py-1 bg-stone-900/50 rounded-full text-sm">
                                                <span className="text-stone-300">
                                                    {ABILITY_TRANSLATIONS[ab.ability_score.index]?.full || ab.ability_score.name}
                                                </span>
                                                <span className="text-green-400 ml-1">+{ab.bonus}</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Dragon ancestry (for dragonborn) */}
                            {selectedRace === 'dragonborn' && (
                                <div className="mb-4">
                                    <h5 className="text-sm font-semibold text-stone-400 mb-2">Linaje Dracónico</h5>
                                    <select
                                        value={dragonAncestry}
                                        onChange={handleDragonAncestryChange}
                                        className="w-full px-4 py-2 bg-stone-800/50 border border-stone-600/30 rounded-lg text-stone-200 focus:border-red-500/50 focus:outline-none"
                                    >
                                        <option value="">Selecciona un linaje</option>
                                        {DRAGON_ANCESTRIES.map((ancestry, idx) => (
                                            <option key={idx} value={ancestry.dragon}>
                                                Dragón {ancestry.dragon} - {ancestry.damageType}
                                            </option>
                                        ))}
                                    </select>
                                    {dragonAncestry && (
                                        <p className="mt-2 text-sm text-stone-400">
                                            Arma de Aliento: {DRAGON_ANCESTRIES.find(a => a.dragon === dragonAncestry)?.breathWeapon}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Traits */}
                            {raceDetails.traits.length > 0 && (
                                <div className="mb-4">
                                    <h5 className="text-sm font-semibold text-stone-400 mb-2">Rasgos Raciales</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {raceDetails.traits.map(trait => {
                                            const traitInfo = getTraitInfo(trait.index);
                                            return (
                                                <Tooltip
                                                    key={trait.index}
                                                    content={
                                                        <div>
                                                            <p className="font-semibold text-stone-200 mb-1">{traitInfo.name}</p>
                                                            <p className="text-stone-300 text-xs">{traitInfo.description}</p>
                                                        </div>
                                                    }
                                                >
                                                    <span className="px-3 py-1 bg-stone-800/50 rounded-full text-sm text-stone-300 cursor-help hover:bg-stone-700/50 transition-colors">
                                                        {traitInfo.name}
                                                    </span>
                                                </Tooltip>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Languages */}
                            <div className="mb-4">
                                <h5 className="text-sm font-semibold text-stone-400 mb-2">Idiomas</h5>
                                <div className="flex flex-wrap gap-2">
                                    {raceDetails.languages.map(lang => (
                                        <span key={lang.index} className="px-3 py-1 bg-stone-800/50 rounded-full text-sm text-stone-300">
                                            🗣️ {LANGUAGE_TRANSLATIONS[lang.index] || lang.name}
                                        </span>
                                    ))}
                                    {raceDetails.language_options && (
                                        <span className="px-3 py-1 bg-amber-900/30 border border-amber-600/30 rounded-full text-sm text-amber-300">
                                            +{raceDetails.language_options.choose} idioma(s) a elegir
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Age and alignment descriptions */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <h5 className="font-semibold text-stone-400 mb-1">Edad</h5>
                                    <p className="text-stone-300">{raceDetails.age}</p>
                                </div>
                                <div>
                                    <h5 className="font-semibold text-stone-400 mb-1">Alineamiento</h5>
                                    <p className="text-stone-300">{raceDetails.alignment}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default RaceSelector;
