import React from 'react';
import { SpellDetails, spellsService, COMPONENT_DESCRIPTIONS } from '../../services/spellsService';
import {
    SPELL_NAME_TRANSLATIONS,
    translateRange,
    translateDuration,
    translateCastingTime,
    translateDamageType,
    AOE_TYPE_TRANSLATIONS
} from '../../services/spellTranslations';

interface SpellCardProps {
    spell: SpellDetails;
    onClose: () => void;
}

// Level color mapping for visual distinction
const LEVEL_COLORS: Record<number, string> = {
    0: 'text-stone-400 border-stone-500',
    1: 'text-blue-400 border-blue-500',
    2: 'text-green-400 border-green-500',
    3: 'text-yellow-400 border-yellow-500',
    4: 'text-orange-400 border-orange-500',
    5: 'text-red-400 border-red-500',
    6: 'text-purple-400 border-purple-500',
    7: 'text-pink-400 border-pink-500',
    8: 'text-cyan-400 border-cyan-500',
    9: 'text-amber-400 border-amber-500',
};

// Helper to detect if content is already in Spanish
const isSpanishContent = (text: string): boolean => {
    // Check for common Spanish patterns/words that wouldn't appear in English
    const spanishPatterns = [
        /\btirada de salvación\b/i,
        /\bpuntos de daño\b/i,
        /\bpies\b/i,
        /\bacción\b/i,
        /\bconjuro\b/i,
        /\bcriatura\b/i,
        /\balcance\b/i,
        /\bInstantáneo\b/i,
        /\bConcentración\b/i,
    ];
    return spanishPatterns.some(pattern => pattern.test(text));
};

const SpellCard: React.FC<SpellCardProps> = ({ spell, onClose }) => {
    const levelColor = LEVEL_COLORS[spell.level] || 'text-stone-300 border-stone-500';

    // Get Spanish name - prefer API name if already in Spanish, otherwise use translation
    const spellNameSpanish = SPELL_NAME_TRANSLATIONS[spell.index] || spell.name;

    // Check if API returned Spanish data
    const hasSpanishDesc = spell.desc.length > 0 && isSpanishContent(spell.desc[0]);

    // Get school name - use API if Spanish, otherwise translate
    const schoolName = hasSpanishDesc && spell.school?.name
        ? spell.school.name
        : spellsService.translateSchool(spell.school?.index || '');

    const levelName = spellsService.getLevelName(spell.level);

    // Format components with descriptions
    const componentsText = spell.components
        .map(c => `${c} (${COMPONENT_DESCRIPTIONS[c] || c})`)
        .join(', ');

    // Translate properties if API returned English data
    const castingTimeDisplay = hasSpanishDesc
        ? spell.casting_time
        : translateCastingTime(spell.casting_time);

    const rangeDisplay = hasSpanishDesc
        ? spell.range
        : translateRange(spell.range);

    const durationDisplay = hasSpanishDesc
        ? spell.duration
        : translateDuration(spell.duration);

    // Translate damage type
    const damageTypeDisplay = spell.damage?.damage_type
        ? (hasSpanishDesc ? spell.damage.damage_type.name : translateDamageType(spell.damage.damage_type.index))
        : null;

    // Translate area of effect type
    const aoeTypeDisplay = spell.area_of_effect
        ? (hasSpanishDesc ? spell.area_of_effect.type : (AOE_TYPE_TRANSLATIONS[spell.area_of_effect.type] || spell.area_of_effect.type))
        : null;

    return (
        <div className="bg-stone-900/80 border border-stone-700 rounded-lg p-6 backdrop-blur-sm animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className={`font-title text-2xl ${levelColor.split(' ')[0]}`}>
                        {spellNameSpanish}
                    </h2>
                    {spellNameSpanish !== spell.name && (
                        <p className="text-stone-500 text-xs mt-0.5 italic">
                            {spell.name}
                        </p>
                    )}
                    <p className="text-stone-400 text-sm mt-1">
                        {spell.level === 0 ? `${schoolName} (${levelName})` : `${schoolName} de ${levelName}`}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="text-stone-500 hover:text-stone-300 transition-colors text-2xl leading-none p-1"
                    title="Cerrar"
                >
                    ×
                </button>
            </div>

            {/* Quick Stats - Compact inline layout */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-xs text-stone-400 border-b border-stone-700/50 pb-3">
                <span><span className="text-stone-500">Lanzamiento:</span> <span className="text-stone-200">{castingTimeDisplay}</span></span>
                <span><span className="text-stone-500">Alcance:</span> <span className="text-stone-200">{rangeDisplay}</span></span>
                <span><span className="text-stone-500">Duración:</span> <span className="text-stone-200">{durationDisplay}</span></span>
                <span><span className="text-stone-500">Comp:</span> <span className="text-stone-200">{spell.components.join(', ')}</span></span>
                {spell.material && (
                    <span className="w-full text-stone-500 italic text-xs">Material: {spell.material}</span>
                )}
            </div>

            {/* Tags */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {spell.concentration && (
                    <span className="px-2 py-1 bg-purple-900/50 border border-purple-700/50 text-purple-300 text-xs rounded-full">
                        ⟡ Concentración
                    </span>
                )}
                {spell.ritual && (
                    <span className="px-2 py-1 bg-blue-900/50 border border-blue-700/50 text-blue-300 text-xs rounded-full">
                        ✧ Ritual
                    </span>
                )}
                {damageTypeDisplay && (
                    <span className="px-2 py-1 bg-red-900/50 border border-red-700/50 text-red-300 text-xs rounded-full">
                        ⚔ Daño: {damageTypeDisplay}
                    </span>
                )}
                {spell.area_of_effect && (
                    <span className="px-2 py-1 bg-amber-900/50 border border-amber-700/50 text-amber-300 text-xs rounded-full">
                        ◉ Área: {spell.area_of_effect.size} pies ({aoeTypeDisplay})
                    </span>
                )}
            </div>

            {/* Description */}
            <div className="mb-6">
                <h3 className="text-stone-400 text-xs uppercase tracking-wider mb-2">Descripción</h3>
                <div className="prose prose-invert prose-stone max-w-none">
                    {spell.desc.map((paragraph, idx) => (
                        <p key={idx} className="text-stone-300 mb-3 leading-relaxed">
                            {paragraph}
                        </p>
                    ))}
                </div>
                {!hasSpanishDesc && (
                    <p className="text-stone-600 text-xs mt-2 italic">
                        (Descripción en inglés - traducción no disponible)
                    </p>
                )}
            </div>

            {/* Higher Level */}
            {spell.higher_level && spell.higher_level.length > 0 && (
                <div className="mb-6 bg-stone-800/30 border border-stone-700/50 rounded p-4">
                    <h3 className="text-amber-400 text-xs uppercase tracking-wider mb-2">
                        ⬆ A Niveles Superiores
                    </h3>
                    {spell.higher_level.map((text, idx) => (
                        <p key={idx} className="text-stone-300 text-sm leading-relaxed">
                            {text}
                        </p>
                    ))}
                </div>
            )}

            {/* Classes */}
            <div>
                <h3 className="text-stone-400 text-xs uppercase tracking-wider mb-2">Clases</h3>
                <div className="flex gap-2 flex-wrap">
                    {spell.classes.map(cls => (
                        <span
                            key={cls.index}
                            className="px-3 py-1 bg-stone-800 border border-stone-600 text-stone-300 text-sm rounded-full"
                        >
                            {hasSpanishDesc ? cls.name : spellsService.translateClass(cls.index)}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SpellCard;
