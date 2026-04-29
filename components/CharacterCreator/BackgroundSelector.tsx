import React, { useCallback } from 'react';
import {
    BACKGROUNDS,
    BackgroundData,
    SKILL_TRANSLATIONS,
} from '../../services/characterTranslations';

interface BackgroundSelectorProps {
    selectedBackground: string;
    onBackgroundChange: (background: string, skills: string[]) => void;
}

const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({
    selectedBackground,
    onBackgroundChange,
}) => {
    const handleBackgroundClick = useCallback((background: BackgroundData) => {
        onBackgroundChange(background.index, background.skillProficiencies);
    }, [onBackgroundChange]);

    const selectedBg = BACKGROUNDS.find(b => b.index === selectedBackground);

    return (
        <div>
            <h3 className="font-title text-2xl text-red-400 mb-4">Elige tu Trasfondo</h3>
            <p className="text-stone-400 mb-6">
                Tu trasfondo revela tu origen y cómo te convertiste en aventurero.
            </p>

            {/* Background grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                {BACKGROUNDS.map(bg => {
                    const isSelected = selectedBackground === bg.index;

                    return (
                        <button
                            key={bg.index}
                            onClick={() => handleBackgroundClick(bg)}
                            className={`p-4 rounded-lg border transition-all text-left ${isSelected
                                    ? 'bg-red-900/40 border-red-500/50 text-red-300 shadow-lg shadow-red-900/20'
                                    : 'bg-stone-900/50 border-stone-600/30 text-stone-300 hover:bg-stone-800/50 hover:border-stone-500/50'
                                }`}
                        >
                            <div className="text-sm font-medium">{bg.name}</div>
                        </button>
                    );
                })}
            </div>

            {/* Background details */}
            {selectedBg && (
                <div className="bg-stone-900/50 border border-stone-600/30 rounded-lg p-4">
                    {/* Header */}
                    <div className="mb-4 pb-3 border-b border-stone-700/50">
                        <h4 className="text-xl font-semibold text-stone-200 mb-2">
                            {selectedBg.name}
                        </h4>
                        <p className="text-stone-400 text-sm">
                            {selectedBg.description}
                        </p>
                    </div>

                    {/* Skill proficiencies */}
                    <div className="mb-4">
                        <h5 className="text-sm font-semibold text-stone-400 mb-2">
                            Competencias en Habilidades
                        </h5>
                        <div className="flex flex-wrap gap-2">
                            {selectedBg.skillProficiencies.map(skillIndex => (
                                <span
                                    key={skillIndex}
                                    className="px-3 py-1 bg-green-900/30 border border-green-600/30 rounded-full text-sm text-green-300"
                                >
                                    {SKILL_TRANSLATIONS[skillIndex] || skillIndex}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Tool proficiencies */}
                    {selectedBg.toolProficiencies.length > 0 && (
                        <div className="mb-4">
                            <h5 className="text-sm font-semibold text-stone-400 mb-2">
                                Competencias en Herramientas
                            </h5>
                            <div className="flex flex-wrap gap-2">
                                {selectedBg.toolProficiencies.map((tool, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 bg-amber-900/30 border border-amber-600/30 rounded-full text-sm text-amber-300"
                                    >
                                        🔧 {tool}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Languages */}
                    {selectedBg.languages > 0 && (
                        <div className="mb-4">
                            <h5 className="text-sm font-semibold text-stone-400 mb-2">
                                Idiomas
                            </h5>
                            <span className="px-3 py-1 bg-blue-900/30 border border-blue-600/30 rounded-full text-sm text-blue-300">
                                🗣️ {selectedBg.languages} idioma(s) a elegir
                            </span>
                        </div>
                    )}

                    {/* Equipment */}
                    <div className="mb-4">
                        <h5 className="text-sm font-semibold text-stone-400 mb-2">
                            Equipo Inicial
                        </h5>
                        <div className="flex flex-wrap gap-2">
                            {selectedBg.equipment.map((item, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1 bg-stone-800/50 rounded-full text-sm text-stone-300"
                                >
                                    📦 {item}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Feature */}
                    <div className="p-4 bg-purple-900/20 border border-purple-600/30 rounded-lg">
                        <h5 className="text-sm font-semibold text-purple-300 mb-2">
                            ✨ Rasgo: {selectedBg.feature.name}
                        </h5>
                        <p className="text-sm text-stone-300">
                            {selectedBg.feature.description}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BackgroundSelector;
