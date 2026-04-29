import React, { useState, useCallback, useMemo } from 'react';
import { CharacterAbilityScores, characterService } from '../../services/characterService';
import {
    ABILITY_TRANSLATIONS,
    POINT_BUY_COSTS,
    STANDARD_ARRAY,
    POINT_BUY_TOTAL,
    UI_LABELS,
} from '../../services/characterTranslations';

interface AbilityScoresProps {
    scores: CharacterAbilityScores;
    racialBonuses: Partial<CharacterAbilityScores>;
    onChange: (scores: CharacterAbilityScores) => void;
}

type AbilityKey = keyof CharacterAbilityScores;

const ABILITIES: { key: AbilityKey; icon: string }[] = [
    { key: 'str', icon: '💪' },
    { key: 'dex', icon: '🎯' },
    { key: 'con', icon: '❤️' },
    { key: 'int', icon: '🧠' },
    { key: 'wis', icon: '👁️' },
    { key: 'cha', icon: '✨' },
];

const AbilityScores: React.FC<AbilityScoresProps> = ({
    scores,
    racialBonuses,
    onChange,
}) => {
    const [method, setMethod] = useState<'pointbuy' | 'standard'>('pointbuy');
    const [standardArrayAssignments, setStandardArrayAssignments] = useState<Record<AbilityKey, number | null>>({
        str: null,
        dex: null,
        con: null,
        int: null,
        wis: null,
        cha: null,
    });

    // Calculate points spent in point buy
    const pointsSpent = useMemo(() => {
        return Object.values(scores).reduce((total, score) => {
            return total + (POINT_BUY_COSTS[score] || 0);
        }, 0);
    }, [scores]);

    const pointsRemaining = POINT_BUY_TOTAL - pointsSpent;

    // Handle point buy adjustment
    const handlePointBuyChange = useCallback((ability: AbilityKey, delta: number) => {
        const currentScore = scores[ability];
        const newScore = currentScore + delta;

        // Check bounds
        if (newScore < 8 || newScore > 15) return;

        // Check if we have enough points
        const currentCost = POINT_BUY_COSTS[currentScore] || 0;
        const newCost = POINT_BUY_COSTS[newScore] || 0;
        const costDelta = newCost - currentCost;

        if (pointsRemaining - costDelta < 0) return;

        onChange({
            ...scores,
            [ability]: newScore,
        });
    }, [scores, pointsRemaining, onChange]);

    // Handle standard array assignment
    const handleStandardArrayAssign = useCallback((ability: AbilityKey, value: number) => {
        // Check if value is already assigned to another ability
        const currentlyAssigned = Object.entries(standardArrayAssignments).find(
            ([key, val]) => val === value && key !== ability
        );

        // Create new assignments
        const newAssignments = { ...standardArrayAssignments };

        // If reassigning from another ability, clear that one
        if (currentlyAssigned) {
            newAssignments[currentlyAssigned[0] as AbilityKey] = null;
        }

        // Assign to current ability
        newAssignments[ability] = value;
        setStandardArrayAssignments(newAssignments);

        // Update scores
        const newScores: CharacterAbilityScores = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
        for (const [key, val] of Object.entries(newAssignments)) {
            if (val !== null) {
                newScores[key as AbilityKey] = val;
            }
        }
        onChange(newScores);
    }, [standardArrayAssignments, onChange]);

    // Get available standard array values
    const getAvailableValues = useCallback((ability: AbilityKey) => {
        const assigned = Object.entries(standardArrayAssignments)
            .filter(([key, val]) => val !== null && key !== ability)
            .map(([, val]) => val);
        return STANDARD_ARRAY.filter(v => !assigned.includes(v));
    }, [standardArrayAssignments]);

    // Switch method
    const handleMethodChange = useCallback((newMethod: 'pointbuy' | 'standard') => {
        setMethod(newMethod);
        // Reset scores
        onChange({ str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 });
        setStandardArrayAssignments({ str: null, dex: null, con: null, int: null, wis: null, cha: null });
    }, [onChange]);

    return (
        <div>
            <h3 className="font-title text-2xl text-red-400 mb-4">Puntuaciones de Característica</h3>
            <p className="text-stone-400 mb-6">
                Las características definen las capacidades básicas de tu personaje. Elige cómo distribuirlas.
            </p>

            {/* Method selection */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => handleMethodChange('pointbuy')}
                    className={`flex-1 p-4 rounded-lg border transition-all ${method === 'pointbuy'
                            ? 'bg-red-900/40 border-red-500/50 text-red-300'
                            : 'bg-stone-900/50 border-stone-600/30 text-stone-300 hover:bg-stone-800/50'
                        }`}
                >
                    <div className="text-xl mb-1">📊</div>
                    <div className="font-semibold">{UI_LABELS.pointBuy}</div>
                    <div className="text-xs text-stone-400 mt-1">27 puntos para distribuir</div>
                </button>
                <button
                    onClick={() => handleMethodChange('standard')}
                    className={`flex-1 p-4 rounded-lg border transition-all ${method === 'standard'
                            ? 'bg-red-900/40 border-red-500/50 text-red-300'
                            : 'bg-stone-900/50 border-stone-600/30 text-stone-300 hover:bg-stone-800/50'
                        }`}
                >
                    <div className="text-xl mb-1">🎲</div>
                    <div className="font-semibold">{UI_LABELS.standardArray}</div>
                    <div className="text-xs text-stone-400 mt-1">15, 14, 13, 12, 10, 8</div>
                </button>
            </div>

            {/* Points remaining (point buy only) */}
            {method === 'pointbuy' && (
                <div className={`mb-6 p-4 rounded-lg border ${pointsRemaining > 0
                        ? 'bg-amber-900/20 border-amber-600/30'
                        : pointsRemaining === 0
                            ? 'bg-green-900/20 border-green-600/30'
                            : 'bg-red-900/20 border-red-600/30'
                    }`}>
                    <div className="flex items-center justify-between">
                        <span className={`font-semibold ${pointsRemaining > 0 ? 'text-amber-300' : pointsRemaining === 0 ? 'text-green-300' : 'text-red-300'
                            }`}>
                            {UI_LABELS.pointsRemaining}: {pointsRemaining}
                        </span>
                        <span className="text-stone-400 text-sm">
                            Gastados: {pointsSpent}/{POINT_BUY_TOTAL}
                        </span>
                    </div>
                </div>
            )}

            {/* Ability scores grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {ABILITIES.map(({ key, icon }) => {
                    const baseScore = scores[key];
                    const racialBonus = racialBonuses[key] || 0;
                    const totalScore = baseScore + racialBonus;
                    const modifier = characterService.formatModifier(totalScore);

                    return (
                        <div key={key} className="bg-stone-900/50 border border-stone-600/30 rounded-lg p-4">
                            {/* Ability header */}
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-2xl">{icon}</span>
                                <div>
                                    <div className="text-xs text-stone-500">
                                        {ABILITY_TRANSLATIONS[key]?.short}
                                    </div>
                                    <div className="font-semibold text-stone-200">
                                        {ABILITY_TRANSLATIONS[key]?.full}
                                    </div>
                                </div>
                            </div>

                            {/* Score controls */}
                            {method === 'pointbuy' ? (
                                <div className="flex items-center justify-center gap-3 mb-2">
                                    <button
                                        onClick={() => handlePointBuyChange(key, -1)}
                                        disabled={baseScore <= 8}
                                        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${baseScore <= 8
                                                ? 'border-stone-700 text-stone-600 cursor-not-allowed'
                                                : 'border-stone-500 text-stone-300 hover:bg-stone-700'
                                            }`}
                                    >
                                        −
                                    </button>
                                    <div className="text-2xl font-bold text-stone-100 w-10 text-center">
                                        {baseScore}
                                    </div>
                                    <button
                                        onClick={() => handlePointBuyChange(key, 1)}
                                        disabled={baseScore >= 15 || pointsRemaining < (POINT_BUY_COSTS[baseScore + 1] - POINT_BUY_COSTS[baseScore])}
                                        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${baseScore >= 15 || pointsRemaining < (POINT_BUY_COSTS[baseScore + 1] - POINT_BUY_COSTS[baseScore])
                                                ? 'border-stone-700 text-stone-600 cursor-not-allowed'
                                                : 'border-stone-500 text-stone-300 hover:bg-stone-700'
                                            }`}
                                    >
                                        +
                                    </button>
                                </div>
                            ) : (
                                <div className="mb-2">
                                    <select
                                        value={standardArrayAssignments[key] ?? ''}
                                        onChange={(e) => handleStandardArrayAssign(key, parseInt(e.target.value))}
                                        className="w-full px-3 py-2 bg-stone-800/50 border border-stone-600/30 rounded-lg text-stone-200 text-center text-lg font-bold focus:border-red-500/50 focus:outline-none"
                                    >
                                        <option value="">—</option>
                                        {getAvailableValues(key).map(val => (
                                            <option key={val} value={val}>{val}</option>
                                        ))}
                                        {standardArrayAssignments[key] !== null && (
                                            <option value={standardArrayAssignments[key]!}>
                                                {standardArrayAssignments[key]}
                                            </option>
                                        )}
                                    </select>
                                </div>
                            )}

                            {/* Racial bonus and total */}
                            <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-stone-700/50">
                                {racialBonus > 0 ? (
                                    <span className="text-green-400">+{racialBonus} racial</span>
                                ) : (
                                    <span className="text-stone-600">+0 racial</span>
                                )}
                                <div className="text-right">
                                    <span className="text-stone-400">Total: </span>
                                    <span className="font-bold text-stone-200">{totalScore}</span>
                                    <span className={`ml-2 ${characterService.calculateModifier(totalScore) >= 0
                                            ? 'text-green-400'
                                            : 'text-red-400'
                                        }`}>
                                        ({modifier})
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Point cost reference */}
            {method === 'pointbuy' && (
                <div className="mt-6 p-4 bg-stone-900/50 border border-stone-600/30 rounded-lg">
                    <h4 className="text-sm font-semibold text-stone-400 mb-2">Coste de Puntos</h4>
                    <div className="flex flex-wrap gap-2 text-xs">
                        {Object.entries(POINT_BUY_COSTS).map(([score, cost]) => (
                            <span key={score} className="px-2 py-1 bg-stone-800/50 rounded text-stone-300">
                                {score}: <span className="text-amber-400">{cost}pt</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AbilityScores;
