import React, { useState, useEffect, useCallback } from 'react';
import { characterService, ClassData, APIReference } from '../../services/characterService';
import {
    CLASS_TRANSLATIONS,
    CLASS_ICONS,
    ABILITY_TRANSLATIONS,
    SKILL_TRANSLATIONS,
    UI_LABELS,
} from '../../services/characterTranslations';

interface ClassSelectorProps {
    selectedClass: string;
    onClassChange: (classIndex: string, hitDie: number) => void;
    onSkillsChange: (skills: string[]) => void;
    existingSkills: string[];
}

const ClassSelector: React.FC<ClassSelectorProps> = ({
    selectedClass,
    onClassChange,
    onSkillsChange,
    existingSkills,
}) => {
    const [classes, setClasses] = useState<APIReference[]>([]);
    const [classDetails, setClassDetails] = useState<ClassData | null>(null);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load classes on mount
    useEffect(() => {
        const loadClasses = async () => {
            try {
                setIsLoading(true);
                const classList = await characterService.getAllClasses();
                setClasses(classList);
            } catch (err) {
                console.error('Error loading classes:', err);
                setError(UI_LABELS.errorLoading);
            } finally {
                setIsLoading(false);
            }
        };
        loadClasses();
    }, []);

    // Load class details when selection changes
    useEffect(() => {
        if (!selectedClass) {
            setClassDetails(null);
            return;
        }

        const loadClassDetails = async () => {
            try {
                setIsLoadingDetails(true);
                const details = await characterService.getClassDetails(selectedClass);
                setClassDetails(details);
                onClassChange(selectedClass, details.hit_die);
            } catch (err) {
                console.error('Error loading class details:', err);
            } finally {
                setIsLoadingDetails(false);
            }
        };
        loadClassDetails();
    }, [selectedClass, onClassChange]);

    // Handle class selection
    const handleClassClick = useCallback((classIndex: string) => {
        if (classIndex !== selectedClass) {
            setSelectedSkills([]);
        }
        onClassChange(classIndex, 8); // Default hit die, will be updated by effect
    }, [selectedClass, onClassChange]);

    // Handle skill selection
    const handleSkillToggle = useCallback((skillIndex: string, maxSkills: number) => {
        setSelectedSkills(prev => {
            let newSkills: string[];
            if (prev.includes(skillIndex)) {
                newSkills = prev.filter(s => s !== skillIndex);
            } else if (prev.length < maxSkills) {
                newSkills = [...prev, skillIndex];
            } else {
                return prev;
            }
            onSkillsChange(newSkills);
            return newSkills;
        });
    }, [onSkillsChange]);

    // Get available skill options from proficiency choices
    const getSkillOptions = useCallback(() => {
        if (!classDetails?.proficiency_choices) return null;

        const skillChoice = classDetails.proficiency_choices.find(
            choice => choice.type === 'proficiencies' &&
                choice.from.options?.some(opt => opt.item?.index.startsWith('skill-'))
        );

        if (!skillChoice) return null;

        const skills = skillChoice.from.options
            ?.filter(opt => opt.item?.index.startsWith('skill-'))
            .map(opt => ({
                index: opt.item!.index.replace('skill-', ''),
                name: opt.item!.name.replace('Habilidad: ', '').replace('Skill: ', ''),
            })) || [];

        return {
            choose: skillChoice.choose,
            skills,
        };
    }, [classDetails]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <span className="text-4xl mb-4">⚠️</span>
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    const skillOptions = getSkillOptions();

    return (
        <div>
            <h3 className="font-title text-2xl text-red-400 mb-4">Elige tu Clase</h3>
            <p className="text-stone-400 mb-6">
                Tu clase define tus habilidades, capacidades de combate y el camino de tu aventurero.
            </p>

            {isLoading ? (
                <div className="flex items-center justify-center h-32 text-stone-400">
                    <span className="animate-pulse">{UI_LABELS.loadingClasses}</span>
                </div>
            ) : (
                <>
                    {/* Class grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                        {classes.map(cls => {
                            const isSelected = selectedClass === cls.index;
                            const icon = CLASS_ICONS[cls.index] || '⚔️';
                            const translatedName = CLASS_TRANSLATIONS[cls.index] || cls.name;

                            return (
                                <button
                                    key={cls.index}
                                    onClick={() => handleClassClick(cls.index)}
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

                    {/* Class details */}
                    {isLoadingDetails ? (
                        <div className="bg-stone-900/50 border border-stone-600/30 rounded-lg p-4 text-center text-stone-400">
                            <span className="animate-pulse">Cargando detalles...</span>
                        </div>
                    ) : classDetails && (
                        <div className="bg-stone-900/50 border border-stone-600/30 rounded-lg p-4">
                            {/* Class header */}
                            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-stone-700/50">
                                <span className="text-4xl">{CLASS_ICONS[selectedClass] || '⚔️'}</span>
                                <div>
                                    <h4 className="text-xl font-semibold text-stone-200">
                                        {CLASS_TRANSLATIONS[selectedClass] || classDetails.name}
                                    </h4>
                                    <div className="flex items-center gap-4 text-sm text-stone-400">
                                        <span>Dado de Golpe: <span className="text-red-400 font-semibold">d{classDetails.hit_die}</span></span>
                                        {classDetails.spellcasting && (
                                            <span className="text-purple-400">✨ Lanzador de Conjuros</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Saving throws */}
                            <div className="mb-4">
                                <h5 className="text-sm font-semibold text-stone-400 mb-2">Tiradas de Salvación</h5>
                                <div className="flex flex-wrap gap-2">
                                    {classDetails.saving_throws.map(st => (
                                        <span key={st.index} className="px-3 py-1 bg-green-900/30 border border-green-600/30 rounded-full text-sm text-green-300">
                                            {ABILITY_TRANSLATIONS[st.index]?.full || st.name}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Proficiencies */}
                            <div className="mb-4">
                                <h5 className="text-sm font-semibold text-stone-400 mb-2">Competencias</h5>
                                <div className="flex flex-wrap gap-2">
                                    {classDetails.proficiencies
                                        .filter(p => !p.index.startsWith('saving-throw'))
                                        .map(prof => (
                                            <span key={prof.index} className="px-3 py-1 bg-stone-800/50 rounded-full text-sm text-stone-300">
                                                {prof.name}
                                            </span>
                                        ))}
                                </div>
                            </div>

                            {/* Skill proficiency selection */}
                            {skillOptions && (
                                <div className="mb-4 p-4 bg-amber-900/20 border border-amber-600/30 rounded-lg">
                                    <h5 className="text-sm font-semibold text-amber-300 mb-2">
                                        Elige {skillOptions.choose} Habilidades
                                    </h5>
                                    <p className="text-xs text-stone-400 mb-3">
                                        Seleccionadas: {selectedSkills.length}/{skillOptions.choose}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {skillOptions.skills.map(skill => {
                                            const isSelected = selectedSkills.includes(skill.index);
                                            const isDisabled = !isSelected && selectedSkills.length >= skillOptions.choose;

                                            return (
                                                <button
                                                    key={skill.index}
                                                    onClick={() => handleSkillToggle(skill.index, skillOptions.choose)}
                                                    disabled={isDisabled}
                                                    className={`px-3 py-1 rounded-full text-sm transition-colors ${isSelected
                                                            ? 'bg-amber-700/50 border border-amber-500/50 text-amber-200'
                                                            : isDisabled
                                                                ? 'bg-stone-800/30 text-stone-600 cursor-not-allowed'
                                                                : 'bg-stone-800/50 border border-stone-600/30 text-stone-300 hover:border-amber-500/50'
                                                        }`}
                                                >
                                                    {isSelected && '✓ '}
                                                    {SKILL_TRANSLATIONS[skill.index] || skill.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Subclass preview */}
                            {classDetails.subclasses.length > 0 && (
                                <div className="mb-4">
                                    <h5 className="text-sm font-semibold text-stone-400 mb-2">
                                        Subclases Disponibles
                                    </h5>
                                    <div className="flex flex-wrap gap-2">
                                        {classDetails.subclasses.map(sc => (
                                            <span key={sc.index} className="px-3 py-1 bg-purple-900/30 border border-purple-600/30 rounded-full text-sm text-purple-300">
                                                {sc.name}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-stone-500 mt-2">
                                        Las subclases se eligen al alcanzar niveles superiores
                                    </p>
                                </div>
                            )}

                            {/* Spellcasting info */}
                            {classDetails.spellcasting && (
                                <div className="p-3 bg-purple-900/20 border border-purple-600/30 rounded-lg">
                                    <h5 className="text-sm font-semibold text-purple-300 mb-1">
                                        ✨ Aptitud Mágica
                                    </h5>
                                    <p className="text-sm text-stone-300">
                                        Esta clase puede lanzar conjuros a partir del nivel {classDetails.spellcasting.level}.
                                    </p>
                                    <p className="text-xs text-stone-400 mt-1">
                                        Característica de lanzamiento: {
                                            ABILITY_TRANSLATIONS[classDetails.spellcasting.spellcasting_ability.index]?.full ||
                                            classDetails.spellcasting.spellcasting_ability.name
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ClassSelector;
