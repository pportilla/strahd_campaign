import React, { useState, useEffect, useCallback } from 'react';
import { characterService, ClassData, APIReference } from '../../services/characterService';
import { getEquipmentIcon, UI_LABELS } from '../../services/characterTranslations';

interface EquipmentChoice {
    equipment: APIReference;
    quantity: number;
}

interface EquipmentSelectorProps {
    selectedClass: string;
    equipment: EquipmentChoice[];
    onEquipmentChange: (equipment: EquipmentChoice[]) => void;
}

interface EquipmentOption {
    id: string;
    description: string;
    items: Array<{
        equipment: APIReference;
        quantity: number;
    }>;
}

interface EquipmentChoiceGroup {
    description: string;
    choose: number;
    options: EquipmentOption[];
    selectedOption: string | null;
}

const EquipmentSelector: React.FC<EquipmentSelectorProps> = ({
    selectedClass,
    equipment,
    onEquipmentChange,
}) => {
    const [classDetails, setClassDetails] = useState<ClassData | null>(null);
    const [choiceGroups, setChoiceGroups] = useState<EquipmentChoiceGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load class details for starting equipment
    useEffect(() => {
        if (!selectedClass) {
            setClassDetails(null);
            setChoiceGroups([]);
            return;
        }

        const loadClassDetails = async () => {
            try {
                setIsLoading(true);
                const details = await characterService.getClassDetails(selectedClass);
                setClassDetails(details);

                // Parse equipment options
                const groups: EquipmentChoiceGroup[] = details.starting_equipment_options.map((opt, idx) => {
                    const options: EquipmentOption[] = [];

                    if (opt.from.options) {
                        opt.from.options.forEach((option, optIdx) => {
                            const items: Array<{ equipment: APIReference; quantity: number }> = [];

                            if (option.option_type === 'counted_reference' && option.of) {
                                items.push({
                                    equipment: option.of,
                                    quantity: option.count || 1,
                                });
                            } else if (option.option_type === 'multiple' && option.items) {
                                option.items.forEach(item => {
                                    if (item.of) {
                                        items.push({
                                            equipment: item.of,
                                            quantity: item.count || 1,
                                        });
                                    }
                                });
                            } else if (option.option_type === 'choice') {
                                // Equipment category choice - we'll show a placeholder
                                items.push({
                                    equipment: {
                                        index: `choice-${idx}-${optIdx}`,
                                        name: 'Arma a elegir',
                                        url: ''
                                    },
                                    quantity: 1,
                                });
                            }

                            if (items.length > 0) {
                                options.push({
                                    id: `option-${idx}-${optIdx}`,
                                    description: items.map(i =>
                                        i.quantity > 1 ? `${i.quantity}x ${i.equipment.name}` : i.equipment.name
                                    ).join(' + '),
                                    items,
                                });
                            }
                        });
                    }

                    return {
                        description: opt.desc,
                        choose: opt.choose,
                        options,
                        selectedOption: options.length > 0 ? options[0].id : null,
                    };
                });

                setChoiceGroups(groups);

                // Initialize equipment with first options selected
                const initialEquipment: EquipmentChoice[] = [];

                // Add fixed starting equipment
                details.starting_equipment.forEach(eq => {
                    initialEquipment.push({
                        equipment: eq.equipment,
                        quantity: eq.quantity,
                    });
                });

                // Add first option from each choice group
                groups.forEach(group => {
                    if (group.selectedOption) {
                        const option = group.options.find(o => o.id === group.selectedOption);
                        if (option) {
                            option.items.forEach(item => {
                                initialEquipment.push(item);
                            });
                        }
                    }
                });

                onEquipmentChange(initialEquipment);
            } catch (err) {
                console.error('Error loading class details:', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadClassDetails();
    }, [selectedClass, onEquipmentChange]);

    // Handle equipment choice selection
    const handleOptionSelect = useCallback((groupIdx: number, optionId: string) => {
        const newGroups = [...choiceGroups];
        newGroups[groupIdx].selectedOption = optionId;
        setChoiceGroups(newGroups);

        // Rebuild equipment list
        const newEquipment: EquipmentChoice[] = [];

        // Add fixed starting equipment
        if (classDetails) {
            classDetails.starting_equipment.forEach(eq => {
                newEquipment.push({
                    equipment: eq.equipment,
                    quantity: eq.quantity,
                });
            });
        }

        // Add selected options from each choice group
        newGroups.forEach(group => {
            if (group.selectedOption) {
                const option = group.options.find(o => o.id === group.selectedOption);
                if (option) {
                    option.items.forEach(item => {
                        newEquipment.push(item);
                    });
                }
            }
        });

        onEquipmentChange(newEquipment);
    }, [choiceGroups, classDetails, onEquipmentChange]);

    if (!selectedClass) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <span className="text-4xl mb-4 opacity-30">🎒</span>
                <p className="text-stone-400">Selecciona primero una clase para ver el equipo inicial</p>
            </div>
        );
    }

    return (
        <div>
            <h3 className="font-title text-2xl text-red-400 mb-4">Equipo Inicial</h3>
            <p className="text-stone-400 mb-6">
                Elige el equipo con el que tu personaje comenzará su aventura.
            </p>

            {isLoading ? (
                <div className="flex items-center justify-center h-32 text-stone-400">
                    <span className="animate-pulse">{UI_LABELS.loadingEquipment}</span>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Fixed starting equipment */}
                    {classDetails && classDetails.starting_equipment.length > 0 && (
                        <div className="bg-stone-900/50 border border-stone-600/30 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-stone-400 mb-3">
                                Equipo Inicial Fijo
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {classDetails.starting_equipment.map((eq, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-2 bg-stone-800/50 rounded-lg text-sm text-stone-300 flex items-center gap-2"
                                    >
                                        <span className="text-lg">
                                            {getEquipmentIcon(eq.equipment.index)}
                                        </span>
                                        {eq.quantity > 1 ? `${eq.quantity}x ` : ''}
                                        {eq.equipment.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Equipment choices */}
                    {choiceGroups.map((group, groupIdx) => (
                        <div key={groupIdx} className="bg-stone-900/50 border border-stone-600/30 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-amber-300 mb-3">
                                {group.description}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {group.options.map((option) => {
                                    const isSelected = group.selectedOption === option.id;

                                    return (
                                        <button
                                            key={option.id}
                                            onClick={() => handleOptionSelect(groupIdx, option.id)}
                                            className={`p-4 rounded-lg border transition-all text-left ${isSelected
                                                    ? 'bg-amber-900/40 border-amber-500/50 text-amber-200'
                                                    : 'bg-stone-800/50 border-stone-600/30 text-stone-300 hover:bg-stone-700/50 hover:border-stone-500/50'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Radio indicator */}
                                                <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected
                                                        ? 'border-amber-400 bg-amber-400'
                                                        : 'border-stone-500'
                                                    }`}>
                                                    {isSelected && (
                                                        <div className="w-2 h-2 rounded-full bg-stone-900" />
                                                    )}
                                                </div>

                                                {/* Option content */}
                                                <div className="flex-1">
                                                    <div className="flex flex-wrap gap-2">
                                                        {option.items.map((item, itemIdx) => (
                                                            <span key={itemIdx} className="flex items-center gap-1">
                                                                <span className="text-lg">
                                                                    {getEquipmentIcon(item.equipment.index)}
                                                                </span>
                                                                <span className="text-sm">
                                                                    {item.quantity > 1 ? `${item.quantity}x ` : ''}
                                                                    {item.equipment.name}
                                                                </span>
                                                                {itemIdx < option.items.length - 1 && (
                                                                    <span className="text-stone-500 mx-1">+</span>
                                                                )}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Current equipment summary */}
                    <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-green-300 mb-3">
                            🎒 Tu Inventario
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {equipment.filter(eq => !eq.equipment.index.startsWith('choice-')).map((eq, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-2 bg-stone-900/50 rounded-lg text-sm text-stone-200 flex items-center gap-2"
                                >
                                    <span className="text-lg">
                                        {getEquipmentIcon(eq.equipment.index)}
                                    </span>
                                    {eq.quantity > 1 ? `${eq.quantity}x ` : ''}
                                    {eq.equipment.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EquipmentSelector;
