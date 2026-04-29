import React, { useState, useCallback, useEffect } from 'react';
import { characterService, CharacterSheet, CharacterAbilityScores, APIReference } from '../../services/characterService';
import { UI_LABELS, STANDARD_ARRAY, RACE_TRANSLATIONS, CLASS_TRANSLATIONS, RACE_ICONS } from '../../services/characterTranslations';
import RaceSelector from './RaceSelector';
import ClassSelector from './ClassSelector';
import AbilityScores from './AbilityScores';
import BackgroundSelector from './BackgroundSelector';
import EquipmentSelector from './EquipmentSelector';
import CharacterSummary from './CharacterSummary';
import CharacterManager from './CharacterManager';

// Steps configuration
const STEPS = [
    { id: 1, label: UI_LABELS.step1, icon: '👤' },
    { id: 2, label: UI_LABELS.step2, icon: '⚔️' },
    { id: 3, label: UI_LABELS.step3, icon: '📊' },
    { id: 4, label: UI_LABELS.step4, icon: '📖' },
    { id: 5, label: UI_LABELS.step5, icon: '🎒' },
    { id: 6, label: UI_LABELS.step6, icon: '📜' },
];

// Initial character state
const initialAbilityScores: CharacterAbilityScores = {
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
};

interface EquipmentChoice {
    equipment: APIReference;
    quantity: number;
}

interface CharacterState {
    name: string;
    race: string;
    subrace: string;
    dragonAncestry?: string;
    class: string;
    level: number;
    background: string;
    abilityScores: CharacterAbilityScores;
    racialBonuses: Partial<CharacterAbilityScores>;
    skillProficiencies: string[];
    equipment: EquipmentChoice[];
    languages: string[];
    classHitDie: number;
}

const initialCharacterState: CharacterState = {
    name: '',
    race: '',
    subrace: '',
    class: '',
    level: 1,
    background: '',
    abilityScores: initialAbilityScores,
    racialBonuses: {},
    skillProficiencies: [],
    equipment: [],
    languages: [],
    classHitDie: 8,
};

const CharacterCreator: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [character, setCharacter] = useState<CharacterState>(initialCharacterState);
    const [savedCharacters, setSavedCharacters] = useState<CharacterSheet[]>([]);
    const [showSavedCharacters, setShowSavedCharacters] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [managingCharacter, setManagingCharacter] = useState<CharacterSheet | null>(null);

    // Load saved characters on mount
    useEffect(() => {
        setSavedCharacters(characterService.getAllCharacters());
    }, []);

    // Navigation handlers
    const handleNext = useCallback(() => {
        if (currentStep < STEPS.length) {
            setCurrentStep(prev => prev + 1);
        }
    }, [currentStep]);

    const handlePrevious = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    }, [currentStep]);

    const handleStepClick = useCallback((step: number) => {
        setCurrentStep(step);
    }, []);

    // Character update handlers
    const handleRaceChange = useCallback((race: string, subrace: string, bonuses: Partial<CharacterAbilityScores>, languages: string[], dragonAncestry?: string) => {
        setCharacter(prev => ({
            ...prev,
            race,
            subrace,
            dragonAncestry,
            racialBonuses: bonuses,
            languages,
        }));
    }, []);

    const handleClassChange = useCallback((classIndex: string, hitDie: number) => {
        setCharacter(prev => ({
            ...prev,
            class: classIndex,
            classHitDie: hitDie,
        }));
    }, []);

    const handleAbilityScoresChange = useCallback((scores: CharacterAbilityScores) => {
        setCharacter(prev => ({
            ...prev,
            abilityScores: scores,
        }));
    }, []);

    const handleBackgroundChange = useCallback((background: string, skills: string[]) => {
        setCharacter(prev => ({
            ...prev,
            background,
            skillProficiencies: [...new Set([...prev.skillProficiencies.filter(s => !skills.includes(s)), ...skills])],
        }));
    }, []);

    const handleSkillsChange = useCallback((skills: string[]) => {
        setCharacter(prev => ({
            ...prev,
            skillProficiencies: skills,
        }));
    }, []);

    const handleEquipmentChange = useCallback((equipment: EquipmentChoice[]) => {
        setCharacter(prev => ({
            ...prev,
            equipment,
        }));
    }, []);

    const handleNameChange = useCallback((name: string) => {
        setCharacter(prev => ({ ...prev, name }));
    }, []);

    // Save character
    const handleSaveCharacter = useCallback(() => {
        const totalScores: CharacterAbilityScores = {
            str: character.abilityScores.str + (character.racialBonuses.str || 0),
            dex: character.abilityScores.dex + (character.racialBonuses.dex || 0),
            con: character.abilityScores.con + (character.racialBonuses.con || 0),
            int: character.abilityScores.int + (character.racialBonuses.int || 0),
            wis: character.abilityScores.wis + (character.racialBonuses.wis || 0),
            cha: character.abilityScores.cha + (character.racialBonuses.cha || 0),
        };

        const characterSheet: CharacterSheet = {
            id: characterService.generateId(),
            name: character.name || 'Sin Nombre',
            race: character.race,
            subrace: character.subrace || undefined,
            class: character.class,
            level: character.level,
            background: character.background,
            abilityScores: totalScores,
            skillProficiencies: character.skillProficiencies,
            equipment: character.equipment.map(e => ({
                index: e.equipment.index,
                name: e.equipment.name,
                quantity: e.quantity,
            })),
            hitPoints: characterService.calculateHitPoints(character.classHitDie, totalScores.con, character.level),
            createdAt: '',
            updatedAt: '',
        };

        characterService.saveCharacter(characterSheet);
        setSavedCharacters(characterService.getAllCharacters());
        setSaveMessage(UI_LABELS.characterSaved);
        setTimeout(() => setSaveMessage(null), 3000);
    }, [character]);

    // Reset character
    const handleReset = useCallback(() => {
        setCharacter(initialCharacterState);
        setCurrentStep(1);
    }, []);

    // Load saved character
    const handleLoadCharacter = useCallback((char: CharacterSheet) => {
        setCharacter({
            name: char.name,
            race: char.race,
            subrace: char.subrace || '',
            class: char.class,
            level: char.level,
            background: char.background,
            abilityScores: char.abilityScores,
            racialBonuses: {},
            skillProficiencies: char.skillProficiencies,
            equipment: char.equipment.map(e => ({
                equipment: { index: e.index, name: e.name, url: '' },
                quantity: e.quantity,
            })),
            languages: [],
            classHitDie: 8,
        });
        setShowSavedCharacters(false);
        setCurrentStep(6);
    }, []);

    // Delete saved character
    const handleDeleteCharacter = useCallback((id: string) => {
        characterService.deleteCharacter(id);
        setSavedCharacters(characterService.getAllCharacters());
    }, []);

    // Open character manager
    const handleManageCharacter = useCallback((char: CharacterSheet) => {
        setManagingCharacter(char);
    }, []);

    // Update character from manager
    const handleUpdateCharacter = useCallback((updatedChar: CharacterSheet) => {
        characterService.saveCharacter(updatedChar);
        setSavedCharacters(characterService.getAllCharacters());
        setManagingCharacter(null);
        setSaveMessage('¡Cambios guardados!');
        setTimeout(() => setSaveMessage(null), 3000);
    }, []);

    // Validation
    const canProceed = useCallback((): boolean => {
        switch (currentStep) {
            case 1:
                return character.race !== '';
            case 2:
                return character.class !== '';
            case 3:
                return true;
            case 4:
                return character.background !== '';
            case 5:
                return true;
            case 6:
                return character.name !== '';
            default:
                return true;
        }
    }, [currentStep, character]);

    // Render current step content
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <RaceSelector
                        selectedRace={character.race}
                        selectedSubrace={character.subrace}
                        selectedDragonAncestry={character.dragonAncestry}
                        onRaceChange={handleRaceChange}
                    />
                );
            case 2:
                return (
                    <ClassSelector
                        selectedClass={character.class}
                        onClassChange={handleClassChange}
                        onSkillsChange={handleSkillsChange}
                        existingSkills={character.skillProficiencies}
                    />
                );
            case 3:
                return (
                    <AbilityScores
                        scores={character.abilityScores}
                        racialBonuses={character.racialBonuses}
                        onChange={handleAbilityScoresChange}
                    />
                );
            case 4:
                return (
                    <BackgroundSelector
                        selectedBackground={character.background}
                        onBackgroundChange={handleBackgroundChange}
                    />
                );
            case 5:
                return (
                    <EquipmentSelector
                        selectedClass={character.class}
                        equipment={character.equipment}
                        onEquipmentChange={handleEquipmentChange}
                    />
                );
            case 6:
                return (
                    <CharacterSummary
                        character={character}
                        onNameChange={handleNameChange}
                        onSave={handleSaveCharacter}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div>
            {/* If managing a character, show the CharacterManager as main content */}
            {managingCharacter ? (
                <CharacterManager
                    character={managingCharacter}
                    onUpdate={handleUpdateCharacter}
                    onClose={() => setManagingCharacter(null)}
                />
            ) : (
                <>
                    {/* Header */}
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h2 className="font-title text-3xl text-red-500 mb-2">Creador de Personajes</h2>
                            <p className="text-stone-400">
                                Forja tu destino en las brumas de Barovia. Crea un aventurero digno de enfrentar la oscuridad.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowSavedCharacters(!showSavedCharacters)}
                            className="px-4 py-2 bg-stone-700/50 hover:bg-stone-700 text-stone-300 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <span>📋</span>
                            <span>Personajes Guardados ({savedCharacters.length})</span>
                        </button>
                    </div>

                    {/* Save message */}
                    {saveMessage && (
                        <div className="mb-4 p-3 bg-green-900/50 border border-green-600/50 rounded-lg text-green-300 flex items-center gap-2 animate-fade-in">
                            <span>✓</span>
                            <span>{saveMessage}</span>
                        </div>
                    )}

                    {/* Saved characters panel */}
                    {showSavedCharacters && savedCharacters.length > 0 && (
                        <div className="mb-6 bg-stone-800/30 border border-stone-700/50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-stone-300 mb-3">Personajes Guardados</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {savedCharacters.map(char => (
                                    <div
                                        key={char.id}
                                        className="bg-stone-900/50 border border-stone-600/30 rounded-lg p-3"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-2xl">{RACE_ICONS[char.race] || '👤'}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-stone-200 truncate">{char.name}</p>
                                                <p className="text-sm text-stone-400">
                                                    {RACE_TRANSLATIONS[char.race]} {CLASS_TRANSLATIONS[char.class]} Nv.{char.level}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleManageCharacter(char)}
                                                className="flex-1 px-3 py-1.5 bg-amber-900/30 border border-amber-600/30 rounded text-amber-300 hover:bg-amber-800/30 transition-colors text-sm flex items-center justify-center gap-1"
                                                title="Ver ficha"
                                            >
                                                📋 Ver Ficha
                                            </button>
                                            <button
                                                onClick={() => handleLoadCharacter(char)}
                                                className="px-3 py-1.5 bg-stone-700/50 rounded text-stone-300 hover:bg-stone-600/50 transition-colors text-sm"
                                                title="Editar"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCharacter(char.id)}
                                                className="px-3 py-1.5 bg-stone-700/50 rounded text-stone-400 hover:text-red-400 hover:bg-red-900/30 transition-colors text-sm"
                                                title="Eliminar"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step indicator */}
                    <div className="mb-6 overflow-x-auto">
                        <div className="flex gap-2 min-w-max pb-2">
                            {STEPS.map((step, index) => (
                                <button
                                    key={step.id}
                                    onClick={() => handleStepClick(step.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${currentStep === step.id
                                        ? 'bg-red-900/50 border-red-500/50 text-red-300 border'
                                        : currentStep > step.id
                                            ? 'bg-stone-700/50 border-stone-600/30 text-stone-300 border hover:bg-stone-700'
                                            : 'bg-stone-800/30 border-stone-700/30 text-stone-500 border hover:bg-stone-800/50'
                                        }`}
                                >
                                    <span className="text-lg">{step.icon}</span>
                                    <span className="hidden sm:inline text-sm">{step.label}</span>
                                    {currentStep > step.id && (
                                        <span className="text-green-400 text-sm">✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="bg-stone-800/30 border border-stone-700/50 rounded-lg p-6 min-h-[400px]">
                        {renderStepContent()}
                    </div>

                    {/* Navigation */}
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-stone-500 hover:text-red-400 transition-colors"
                        >
                            🔄 {UI_LABELS.reset}
                        </button>

                        <div className="flex gap-3">
                            {currentStep > 1 && (
                                <button
                                    onClick={handlePrevious}
                                    className="px-6 py-2 bg-stone-700/50 hover:bg-stone-700 text-stone-300 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <span>←</span>
                                    <span>{UI_LABELS.previous}</span>
                                </button>
                            )}
                            {currentStep < STEPS.length && (
                                <button
                                    onClick={handleNext}
                                    disabled={!canProceed()}
                                    className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${canProceed()
                                        ? 'bg-red-900/50 hover:bg-red-800/50 text-red-300 border border-red-500/30'
                                        : 'bg-stone-800/50 text-stone-600 cursor-not-allowed'
                                        }`}
                                >
                                    <span>{UI_LABELS.next}</span>
                                    <span>→</span>
                                </button>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Custom scrollbar styles */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
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
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
            `}</style>
        </div>
    );
};

export default CharacterCreator;
