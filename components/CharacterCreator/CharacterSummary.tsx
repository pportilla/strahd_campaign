import React from 'react';
import { CharacterAbilityScores, characterService } from '../../services/characterService';
import {
    RACE_TRANSLATIONS,
    SUBRACE_TRANSLATIONS,
    CLASS_TRANSLATIONS,
    ABILITY_TRANSLATIONS,
    SKILL_TRANSLATIONS,
    BACKGROUNDS,
    RACE_ICONS,
    CLASS_ICONS,
    getEquipmentIcon,
    UI_LABELS,
} from '../../services/characterTranslations';

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
    equipment: Array<{ equipment: { index: string; name: string }; quantity: number }>;
    languages: string[];
    classHitDie: number;
}

interface CharacterSummaryProps {
    character: CharacterState;
    onNameChange: (name: string) => void;
    onSave: () => void;
}

type AbilityKey = keyof CharacterAbilityScores;

const ABILITIES: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

const CharacterSummary: React.FC<CharacterSummaryProps> = ({
    character,
    onNameChange,
    onSave,
}) => {
    // Calculate total ability scores
    const totalScores: CharacterAbilityScores = {
        str: character.abilityScores.str + (character.racialBonuses.str || 0),
        dex: character.abilityScores.dex + (character.racialBonuses.dex || 0),
        con: character.abilityScores.con + (character.racialBonuses.con || 0),
        int: character.abilityScores.int + (character.racialBonuses.int || 0),
        wis: character.abilityScores.wis + (character.racialBonuses.wis || 0),
        cha: character.abilityScores.cha + (character.racialBonuses.cha || 0),
    };

    // Calculate hit points
    const hitPoints = characterService.calculateHitPoints(
        character.classHitDie,
        totalScores.con,
        character.level
    );

    // Get background data
    const backgroundData = BACKGROUNDS.find(b => b.index === character.background);

    // Proficiency bonus at level 1
    const proficiencyBonus = 2;

    return (
        <div>
            <h3 className="font-title text-2xl text-red-400 mb-4">Resumen del Personaje</h3>
            <p className="text-stone-400 mb-6">
                Revisa los detalles de tu personaje y dale un nombre para completar su creación.
            </p>

            {/* Name input */}
            <div className="mb-6 p-4 bg-stone-900/50 border border-stone-600/30 rounded-lg">
                <label className="block text-sm font-semibold text-stone-400 mb-2">
                    {UI_LABELS.characterName}
                </label>
                <input
                    type="text"
                    value={character.name}
                    onChange={(e) => onNameChange(e.target.value)}
                    placeholder={UI_LABELS.enterName}
                    className="w-full px-4 py-3 bg-stone-800/50 border border-stone-600/30 rounded-lg text-xl text-stone-100 placeholder-stone-500 focus:border-red-500/50 focus:outline-none font-title"
                />
            </div>

            {/* Character sheet layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column - Core info */}
                <div className="space-y-4">
                    {/* Basic info card */}
                    <div className="bg-stone-900/50 border border-stone-600/30 rounded-lg p-4">
                        <div className="flex items-center gap-4 mb-4 pb-3 border-b border-stone-700/50">
                            <div className="text-4xl">
                                {RACE_ICONS[character.race] || '👤'}
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-stone-200">
                                    {character.name || 'Sin Nombre'}
                                </h4>
                                <p className="text-stone-400 text-sm">
                                    {RACE_TRANSLATIONS[character.race] || character.race}
                                    {character.subrace && ` (${SUBRACE_TRANSLATIONS[character.subrace] || character.subrace})`}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-stone-500">Clase:</span>
                                <p className="text-stone-200 font-medium flex items-center gap-1">
                                    <span>{CLASS_ICONS[character.class] || '⚔️'}</span>
                                    {CLASS_TRANSLATIONS[character.class] || character.class}
                                </p>
                            </div>
                            <div>
                                <span className="text-stone-500">Nivel:</span>
                                <p className="text-stone-200 font-medium">{character.level}</p>
                            </div>
                            <div className="col-span-2">
                                <span className="text-stone-500">Trasfondo:</span>
                                <p className="text-stone-200 font-medium">
                                    {backgroundData?.name || character.background}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Combat stats */}
                    <div className="bg-stone-900/50 border border-stone-600/30 rounded-lg p-4">
                        <h5 className="text-sm font-semibold text-stone-400 mb-3">
                            Estadísticas de Combate
                        </h5>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-3 bg-red-900/30 border border-red-600/30 rounded-lg">
                                <div className="text-2xl font-bold text-red-300">{hitPoints}</div>
                                <div className="text-xs text-stone-400">PG</div>
                            </div>
                            <div className="text-center p-3 bg-blue-900/30 border border-blue-600/30 rounded-lg">
                                <div className="text-2xl font-bold text-blue-300">
                                    {10 + characterService.calculateModifier(totalScores.dex)}
                                </div>
                                <div className="text-xs text-stone-400">CA</div>
                            </div>
                            <div className="text-center p-3 bg-amber-900/30 border border-amber-600/30 rounded-lg">
                                <div className="text-2xl font-bold text-amber-300">+{proficiencyBonus}</div>
                                <div className="text-xs text-stone-400">Comp.</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle column - Ability scores */}
                <div className="bg-stone-900/50 border border-stone-600/30 rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-stone-400 mb-3">
                        {UI_LABELS.abilityScores}
                    </h5>
                    <div className="grid grid-cols-2 gap-3">
                        {ABILITIES.map(ability => {
                            const score = totalScores[ability];
                            const modifier = characterService.calculateModifier(score);
                            const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;

                            return (
                                <div key={ability} className="text-center p-3 bg-stone-800/50 rounded-lg">
                                    <div className="text-xs text-stone-500 mb-1">
                                        {ABILITY_TRANSLATIONS[ability]?.short}
                                    </div>
                                    <div className="text-xl font-bold text-stone-200">{score}</div>
                                    <div className={`text-sm ${modifier >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {modStr}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right column - Skills */}
                <div className="bg-stone-900/50 border border-stone-600/30 rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-stone-400 mb-3">
                        Competencias en Habilidades
                    </h5>
                    <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                        {character.skillProficiencies.length > 0 ? (
                            character.skillProficiencies.map(skill => (
                                <div key={skill} className="flex items-center gap-2 px-2 py-1 bg-green-900/20 rounded text-sm">
                                    <span className="text-green-400">✓</span>
                                    <span className="text-stone-200">
                                        {SKILL_TRANSLATIONS[skill] || skill}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-stone-500 text-sm">Ninguna seleccionada</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Equipment section */}
            <div className="mt-6 bg-stone-900/50 border border-stone-600/30 rounded-lg p-4">
                <h5 className="text-sm font-semibold text-stone-400 mb-3">
                    🎒 {UI_LABELS.equipment}
                </h5>
                <div className="flex flex-wrap gap-2">
                    {character.equipment.filter(eq => !eq.equipment.index.startsWith('choice-')).map((eq, idx) => (
                        <span
                            key={idx}
                            className="px-3 py-2 bg-stone-800/50 rounded-lg text-sm text-stone-200 flex items-center gap-2"
                        >
                            <span className="text-lg">
                                {getEquipmentIcon(eq.equipment.index)}
                            </span>
                            {eq.quantity > 1 ? `${eq.quantity}x ` : ''}
                            {eq.equipment.name}
                        </span>
                    ))}
                    {backgroundData && backgroundData.equipment.map((item, idx) => (
                        <span
                            key={`bg-${idx}`}
                            className="px-3 py-2 bg-purple-900/20 border border-purple-600/30 rounded-lg text-sm text-stone-200"
                        >
                            📦 {item}
                        </span>
                    ))}
                </div>
            </div>

            {/* Save button */}
            <div className="mt-8 flex justify-center">
                <button
                    onClick={onSave}
                    disabled={!character.name.trim()}
                    className={`px-8 py-4 rounded-lg text-lg font-title tracking-wider transition-all flex items-center gap-3 ${character.name.trim()
                            ? 'bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 text-red-100 border border-red-500/50 shadow-lg shadow-red-900/30'
                            : 'bg-stone-800/50 text-stone-600 cursor-not-allowed'
                        }`}
                >
                    <span>💾</span>
                    <span>{UI_LABELS.save}</span>
                </button>
            </div>

            {!character.name.trim() && (
                <p className="text-center text-amber-400 text-sm mt-2">
                    ⚠️ {UI_LABELS.nameRequired}
                </p>
            )}
        </div>
    );
};

export default CharacterSummary;
