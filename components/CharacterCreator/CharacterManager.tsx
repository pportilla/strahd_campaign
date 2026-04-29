import React, { useState, useCallback, useEffect } from 'react';
import { characterService, CharacterSheet, CharacterAbilityScores, ClassLevel, APIReference, Race } from '../../services/characterService';
import {
    RACE_TRANSLATIONS,
    SUBRACE_TRANSLATIONS,
    CLASS_TRANSLATIONS,
    ABILITY_TRANSLATIONS,
    SKILL_TRANSLATIONS,
    BACKGROUNDS,
    RACE_ICONS,
    CLASS_ICONS,
    SIZE_TRANSLATIONS,
    LANGUAGE_TRANSLATIONS,
    getEquipmentIcon,
    getTraitInfo,
    UI_LABELS,
} from '../../services/characterTranslations';
import Tooltip from './Tooltip';

interface CharacterManagerProps {
    character: CharacterSheet;
    onUpdate: (character: CharacterSheet) => void;
    onClose: () => void;
}

type AbilityKey = keyof CharacterAbilityScores;
const ABILITIES: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

interface InventoryItem {
    index: string;
    name: string;
    quantity: number;
}

// Common adventuring items with Spanish names
const COMMON_ITEMS = [
    { index: 'rope-50ft', name: 'Cuerda (15m)', icon: '🪢' },
    { index: 'torch', name: 'Antorcha', icon: '🔦' },
    { index: 'rations-1-day', name: 'Raciones (1 día)', icon: '🍖' },
    { index: 'waterskin', name: 'Odre de Agua', icon: '💧' },
    { index: 'bedroll', name: 'Petate', icon: '🛏️' },
    { index: 'tinderbox', name: 'Yesquero', icon: '🔥' },
    { index: 'lantern-hooded', name: 'Linterna con Capucha', icon: '🏮' },
    { index: 'oil-flask', name: 'Frasco de Aceite', icon: '🛢️' },
    { index: 'healers-kit', name: 'Kit de Sanador', icon: '🩹' },
    { index: 'thieves-tools', name: 'Herramientas de Ladrón', icon: '🔓' },
    { index: 'cooks-utensils', name: 'Utensilios de Cocina', icon: '🍳' },
    { index: 'crowbar', name: 'Palanca', icon: '🔧' },
    { index: 'grappling-hook', name: 'Garfio', icon: '⚓' },
    { index: 'piton', name: 'Pitón (10)', icon: '📍' },
    { index: 'hammer', name: 'Martillo', icon: '🔨' },
    { index: 'tent-two-person', name: 'Tienda (2 personas)', icon: '⛺' },
    { index: 'blanket', name: 'Manta', icon: '🛏️' },
    { index: 'candles-10', name: 'Velas (10)', icon: '🕯️' },
    { index: 'chalk', name: 'Tiza', icon: '🖍️' },
    { index: 'mirror-steel', name: 'Espejo de Acero', icon: '🪞' },
    { index: 'ink-bottle', name: 'Tinta', icon: '🖋️' },
    { index: 'ink-pen', name: 'Pluma', icon: '🖊️' },
    { index: 'parchment', name: 'Pergamino (5 hojas)', icon: '📜' },
    { index: 'pouch', name: 'Bolsa', icon: '👝' },
    { index: 'sack', name: 'Saco', icon: '👜' },
    { index: 'vial', name: 'Vial', icon: '🧪' },
    { index: 'flask-empty', name: 'Frasco Vacío', icon: '🍶' },
    { index: 'caltrops', name: 'Abrojos', icon: '📍' },
    { index: 'ball-bearings', name: 'Rodamientos', icon: '⚪' },
    { index: 'chain-10ft', name: 'Cadena (3m)', icon: '⛓️' },
    { index: 'manacles', name: 'Grilletes', icon: '⛓️' },
    { index: 'holy-water', name: 'Agua Bendita', icon: '💧' },
    { index: 'antitoxin', name: 'Antídoto', icon: '🧪' },
    { index: 'component-pouch', name: 'Bolsa de Componentes', icon: '👝' },
    { index: 'spellbook', name: 'Libro de Conjuros', icon: '📕' },
    { index: 'arrows-20', name: 'Flechas (20)', icon: '➤' },
    { index: 'crossbow-bolts-20', name: 'Virotes (20)', icon: '➤' },
];

const CharacterManager: React.FC<CharacterManagerProps> = ({
    character,
    onUpdate,
    onClose,
}) => {
    const [editedCharacter, setEditedCharacter] = useState<CharacterSheet>(character);
    const [newItem, setNewItem] = useState({ name: '', quantity: 1 });
    const [selectedCommonItem, setSelectedCommonItem] = useState<string>('');
    const [levelFeatures, setLevelFeatures] = useState<APIReference[]>([]);
    const [isLoadingFeatures, setIsLoadingFeatures] = useState(false);
    const [raceDetails, setRaceDetails] = useState<Race | null>(null);
    const [classFeatures, setClassFeatures] = useState<APIReference[]>([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Load race details
    useEffect(() => {
        const loadRaceDetails = async () => {
            try {
                const details = await characterService.getRaceDetails(editedCharacter.race);
                setRaceDetails(details);
            } catch (err) {
                console.error('Error loading race details:', err);
            }
        };
        if (editedCharacter.race) {
            loadRaceDetails();
        }
    }, [editedCharacter.race]);

    // Load current level features
    useEffect(() => {
        const loadClassFeatures = async () => {
            setIsLoadingFeatures(true);
            try {
                const levels = await characterService.getClassLevels(editedCharacter.class);
                // Get all features up to current level
                const features: APIReference[] = [];
                levels.forEach(level => {
                    if (level.level <= editedCharacter.level) {
                        features.push(...level.features);
                    }
                });
                setClassFeatures(features);

                // Get next level features
                const nextLevel = levels.find(l => l.level === editedCharacter.level + 1);
                if (nextLevel) {
                    setLevelFeatures(nextLevel.features);
                }
            } catch (err) {
                console.error('Error loading class features:', err);
            }
            setIsLoadingFeatures(false);
        };
        if (editedCharacter.class) {
            loadClassFeatures();
        }
    }, [editedCharacter.class, editedCharacter.level]);

    // Add item to inventory (custom item)
    const handleAddItem = useCallback(() => {
        if (!newItem.name.trim()) return;

        const item: InventoryItem = {
            index: `custom-${Date.now()}`,
            name: newItem.name.trim(),
            quantity: newItem.quantity,
        };

        setEditedCharacter(prev => ({
            ...prev,
            equipment: [...prev.equipment, item],
        }));
        setNewItem({ name: '', quantity: 1 });
        setHasUnsavedChanges(true);
    }, [newItem]);

    // Add item from common items list
    const handleAddCommonItem = useCallback((itemIndex: string) => {
        const commonItem = COMMON_ITEMS.find(i => i.index === itemIndex);
        if (!commonItem) return;

        const item: InventoryItem = {
            index: commonItem.index,
            name: commonItem.name,
            quantity: 1,
        };

        setEditedCharacter(prev => ({
            ...prev,
            equipment: [...prev.equipment, item],
        }));
        setSelectedCommonItem('');
        setHasUnsavedChanges(true);
    }, []);

    // Remove item from inventory
    const handleRemoveItem = useCallback((index: string) => {
        setEditedCharacter(prev => ({
            ...prev,
            equipment: prev.equipment.filter(e => e.index !== index),
        }));
        setHasUnsavedChanges(true);
    }, []);

    // Update item quantity
    const handleUpdateQuantity = useCallback((index: string, delta: number) => {
        setEditedCharacter(prev => ({
            ...prev,
            equipment: prev.equipment.map(e => {
                if (e.index === index) {
                    const newQty = Math.max(1, e.quantity + delta);
                    return { ...e, quantity: newQty };
                }
                return e;
            }),
        }));
        setHasUnsavedChanges(true);
    }, []);

    // Level up
    const handleLevelUp = useCallback(() => {
        if (editedCharacter.level >= 20) return;

        const newLevel = editedCharacter.level + 1;
        const newHP = characterService.calculateHitPoints(
            10,
            editedCharacter.abilityScores.con,
            newLevel
        );

        setEditedCharacter(prev => ({
            ...prev,
            level: newLevel,
            hitPoints: newHP,
        }));
        setHasUnsavedChanges(true);
    }, [editedCharacter]);

    // Save changes
    const handleSave = useCallback(() => {
        onUpdate(editedCharacter);
        setHasUnsavedChanges(false);
    }, [editedCharacter, onUpdate]);

    // Calculate modifiers
    const getModifier = (score: number) => {
        const mod = characterService.calculateModifier(score);
        return mod >= 0 ? `+${mod}` : `${mod}`;
    };

    // Get proficiency bonus
    const profBonus = Math.ceil(1 + editedCharacter.level / 4);

    // Get background data
    const backgroundData = BACKGROUNDS.find(b => b.index === editedCharacter.background);

    return (
        <div>
            {/* Header with back button */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onClose}
                        className="p-2 text-stone-400 hover:text-red-400 transition-colors rounded-lg hover:bg-stone-800/50"
                    >
                        ← Volver
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">{RACE_ICONS[editedCharacter.race] || '👤'}</span>
                        <div>
                            <h2 className="font-title text-3xl text-red-500">{editedCharacter.name}</h2>
                            <p className="text-stone-400">
                                {RACE_TRANSLATIONS[editedCharacter.race]} {CLASS_TRANSLATIONS[editedCharacter.class]} • Nivel {editedCharacter.level}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {hasUnsavedChanges && (
                        <span className="text-amber-400 text-sm">⚠️ Cambios sin guardar</span>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={!hasUnsavedChanges}
                        className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${hasUnsavedChanges
                            ? 'bg-red-900/50 border border-red-500/30 hover:bg-red-800/50 text-red-300'
                            : 'bg-stone-800/50 text-stone-600 cursor-not-allowed'
                            }`}
                    >
                        <span>💾</span>
                        <span>Guardar</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Stats & Combat */}
                <div className="space-y-6">
                    {/* Combat stats */}
                    <div className="bg-stone-800/30 border border-stone-700/50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-stone-400 mb-3">Combate</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-3 bg-red-900/30 border border-red-600/30 rounded-lg">
                                <div className="text-2xl font-bold text-red-300">{editedCharacter.hitPoints}</div>
                                <div className="text-xs text-stone-400">PG</div>
                            </div>
                            <div className="text-center p-3 bg-blue-900/30 border border-blue-600/30 rounded-lg">
                                <div className="text-2xl font-bold text-blue-300">
                                    {10 + characterService.calculateModifier(editedCharacter.abilityScores.dex)}
                                </div>
                                <div className="text-xs text-stone-400">CA</div>
                            </div>
                            <div className="text-center p-3 bg-amber-900/30 border border-amber-600/30 rounded-lg">
                                <div className="text-2xl font-bold text-amber-300">+{profBonus}</div>
                                <div className="text-xs text-stone-400">Comp.</div>
                            </div>
                        </div>
                    </div>

                    {/* Ability scores */}
                    <div className="bg-stone-800/30 border border-stone-700/50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-stone-400 mb-3">{UI_LABELS.abilityScores}</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {ABILITIES.map(ability => (
                                <div key={ability} className="text-center p-2 bg-stone-900/50 rounded-lg">
                                    <div className="text-xs text-stone-500">
                                        {ABILITY_TRANSLATIONS[ability]?.short}
                                    </div>
                                    <div className="text-xl font-bold text-stone-200">
                                        {editedCharacter.abilityScores[ability]}
                                    </div>
                                    <div className={`text-sm ${characterService.calculateModifier(editedCharacter.abilityScores[ability]) >= 0
                                        ? 'text-green-400'
                                        : 'text-red-400'
                                        }`}>
                                        {getModifier(editedCharacter.abilityScores[ability])}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Level Up Panel */}
                    <div className="bg-stone-800/30 border border-stone-700/50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-stone-400 mb-3">⬆️ Subir Nivel</h3>
                        {editedCharacter.level < 20 ? (
                            <>
                                <button
                                    onClick={handleLevelUp}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 rounded-lg font-semibold shadow-lg transition-all flex items-center justify-center gap-2 mb-3"
                                >
                                    <span>⬆️</span>
                                    <span>Subir a Nivel {editedCharacter.level + 1}</span>
                                </button>
                                {levelFeatures.length > 0 && (
                                    <div className="text-xs text-stone-400">
                                        <p className="mb-2">Obtendrás:</p>
                                        <ul className="space-y-1">
                                            {levelFeatures.map(f => (
                                                <li key={f.index} className="text-amber-300">• {f.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        ) : (
                            <span className="text-purple-300">✨ Nivel Máximo Alcanzado</span>
                        )}
                    </div>
                </div>

                {/* Middle Column - Traits & Features */}
                <div className="space-y-6">
                    {/* Racial Traits */}
                    <div className="bg-stone-800/30 border border-stone-700/50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-stone-400 mb-3">
                            {RACE_ICONS[editedCharacter.race]} Rasgos de {RACE_TRANSLATIONS[editedCharacter.race]}
                        </h3>

                        {raceDetails && (
                            <>
                                <div className="text-xs text-stone-500 mb-3">
                                    Velocidad: {raceDetails.speed} pies • Tamaño: {SIZE_TRANSLATIONS[raceDetails.size] || raceDetails.size}
                                </div>

                                {raceDetails.traits.length > 0 ? (
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
                                                    <span className="px-3 py-1.5 bg-stone-900/50 border border-stone-600/30 rounded-full text-sm text-stone-300 cursor-help hover:bg-stone-800/50 hover:border-purple-500/30 transition-colors">
                                                        ✨ {traitInfo.name}
                                                    </span>
                                                </Tooltip>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-stone-500 text-sm">Sin rasgos especiales</p>
                                )}

                                {/* Languages */}
                                <div className="mt-4 pt-3 border-t border-stone-700/50">
                                    <h4 className="text-xs font-semibold text-stone-500 mb-2">Idiomas</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {raceDetails.languages.map(lang => (
                                            <span key={lang.index} className="px-2 py-1 bg-stone-900/50 rounded text-xs text-stone-400">
                                                🗣️ {LANGUAGE_TRANSLATIONS[lang.index] || lang.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Class Features */}
                    <div className="bg-stone-800/30 border border-stone-700/50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-stone-400 mb-3">
                            {CLASS_ICONS[editedCharacter.class]} Rasgos de {CLASS_TRANSLATIONS[editedCharacter.class]}
                        </h3>

                        {isLoadingFeatures ? (
                            <p className="text-stone-500 animate-pulse">Cargando rasgos...</p>
                        ) : classFeatures.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {classFeatures.map(feature => {
                                    const traitInfo = getTraitInfo(feature.index);
                                    return (
                                        <Tooltip
                                            key={feature.index}
                                            content={
                                                <div>
                                                    <p className="font-semibold text-stone-200 mb-1">{feature.name}</p>
                                                    <p className="text-stone-300 text-xs">{traitInfo.description}</p>
                                                </div>
                                            }
                                        >
                                            <span className="px-3 py-1.5 bg-stone-900/50 border border-stone-600/30 rounded-full text-sm text-stone-300 cursor-help hover:bg-stone-800/50 hover:border-amber-500/30 transition-colors">
                                                ⚔️ {feature.name}
                                            </span>
                                        </Tooltip>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-stone-500 text-sm">Sin rasgos de clase aún</p>
                        )}
                    </div>

                    {/* Skills */}
                    <div className="bg-stone-800/30 border border-stone-700/50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-stone-400 mb-3">Competencias en Habilidades</h3>
                        <div className="flex flex-wrap gap-2">
                            {editedCharacter.skillProficiencies.length > 0 ? (
                                editedCharacter.skillProficiencies.map(skill => (
                                    <span key={skill} className="px-2 py-1 bg-green-900/30 border border-green-600/30 rounded text-sm text-green-300">
                                        ✓ {SKILL_TRANSLATIONS[skill] || skill}
                                    </span>
                                ))
                            ) : (
                                <p className="text-stone-500 text-sm">Ninguna</p>
                            )}
                        </div>
                    </div>

                    {/* Background */}
                    {backgroundData && (
                        <div className="bg-stone-800/30 border border-stone-700/50 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-stone-400 mb-3">Trasfondo</h3>
                            <p className="font-medium text-stone-200 mb-1">{backgroundData.name}</p>
                            <p className="text-sm text-stone-400 mb-3">{backgroundData.description}</p>

                            <Tooltip
                                content={
                                    <div>
                                        <p className="font-semibold text-stone-200 mb-1">{backgroundData.feature.name}</p>
                                        <p className="text-stone-300 text-xs">{backgroundData.feature.description}</p>
                                    </div>
                                }
                            >
                                <span className="px-3 py-1.5 bg-purple-900/30 border border-purple-600/30 rounded-full text-sm text-purple-300 cursor-help hover:bg-purple-800/30 transition-colors">
                                    ✨ {backgroundData.feature.name}
                                </span>
                            </Tooltip>
                        </div>
                    )}
                </div>

                {/* Right Column - Inventory */}
                <div className="space-y-6">
                    {/* Add item form */}
                    <div className="bg-stone-800/30 border border-stone-700/50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-stone-400 mb-3">Añadir Objeto</h3>

                        {/* Common items dropdown */}
                        <div className="mb-3">
                            <label className="text-xs text-stone-500 mb-1 block">Objetos Comunes</label>
                            <div className="flex gap-2">
                                <select
                                    value={selectedCommonItem}
                                    onChange={(e) => setSelectedCommonItem(e.target.value)}
                                    className="flex-1 px-3 py-2 bg-stone-900/50 border border-stone-600/30 rounded-lg text-stone-200 focus:border-amber-500/50 focus:outline-none text-sm appearance-none cursor-pointer"
                                >
                                    <option value="">Seleccionar objeto...</option>
                                    {COMMON_ITEMS.map(item => (
                                        <option key={item.index} value={item.index}>
                                            {item.icon} {item.name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => handleAddCommonItem(selectedCommonItem)}
                                    disabled={!selectedCommonItem}
                                    className="px-4 py-2 bg-amber-900/50 border border-amber-600/30 rounded-lg text-amber-300 hover:bg-amber-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex-shrink-0"
                                >
                                    + Añadir
                                </button>
                            </div>
                        </div>

                        {/* Custom item input */}
                        <div>
                            <label className="text-xs text-stone-500 mb-1 block">Objeto Personalizado</label>
                            <div className="flex gap-2 flex-wrap">
                                <input
                                    type="text"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Nombre del objeto..."
                                    className="flex-1 min-w-[150px] px-3 py-2 bg-stone-900/50 border border-stone-600/30 rounded-lg text-stone-200 placeholder-stone-500 focus:border-green-500/50 focus:outline-none text-sm"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                                />
                                <input
                                    type="number"
                                    value={newItem.quantity}
                                    onChange={(e) => setNewItem(prev => ({ ...prev, quantity: Math.max(1, parseInt(e.target.value) || 1) }))}
                                    min="1"
                                    className="w-14 px-2 py-2 bg-stone-900/50 border border-stone-600/30 rounded-lg text-stone-200 text-center focus:border-green-500/50 focus:outline-none text-sm flex-shrink-0"
                                />
                                <button
                                    onClick={handleAddItem}
                                    disabled={!newItem.name.trim()}
                                    className="px-4 py-2 bg-green-900/50 border border-green-600/30 rounded-lg text-green-300 hover:bg-green-800/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex-shrink-0"
                                >
                                    + Añadir
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Inventory list */}
                    <div className="bg-stone-800/30 border border-stone-700/50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-stone-400 mb-3">
                            🎒 Inventario ({editedCharacter.equipment.length})
                        </h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                            {editedCharacter.equipment.length === 0 ? (
                                <p className="text-stone-500 text-sm text-center py-4">
                                    Inventario vacío
                                </p>
                            ) : (
                                editedCharacter.equipment.map((item) => (
                                    <div
                                        key={item.index}
                                        className="flex items-center justify-between p-2 bg-stone-900/50 border border-stone-600/30 rounded-lg"
                                    >
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <span className="text-lg">{getEquipmentIcon(item.index)}</span>
                                            <span className="text-stone-200 text-sm truncate">{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleUpdateQuantity(item.index, -1)}
                                                className="w-6 h-6 rounded bg-stone-700/50 text-stone-300 hover:bg-stone-600/50 text-xs"
                                            >
                                                −
                                            </button>
                                            <span className="w-6 text-center text-stone-200 text-sm">{item.quantity}</span>
                                            <button
                                                onClick={() => handleUpdateQuantity(item.index, 1)}
                                                className="w-6 h-6 rounded bg-stone-700/50 text-stone-300 hover:bg-stone-600/50 text-xs"
                                            >
                                                +
                                            </button>
                                            <button
                                                onClick={() => handleRemoveItem(item.index)}
                                                className="ml-1 p-1 text-stone-500 hover:text-red-400 transition-colors text-xs"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Background equipment */}
                    {backgroundData && backgroundData.equipment.length > 0 && (
                        <div className="bg-stone-800/30 border border-stone-700/50 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-stone-400 mb-3">Equipo del Trasfondo</h3>
                            <div className="space-y-1">
                                {backgroundData.equipment.map((item, idx) => (
                                    <div key={idx} className="text-sm text-stone-300 flex items-center gap-2">
                                        <span>📦</span>
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CharacterManager;
