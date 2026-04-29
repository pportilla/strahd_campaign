// Spanish Translations for D&D 5e Character Creation
// Official translations where available

// =============================================================================
// RACE TRANSLATIONS
// =============================================================================

export const RACE_TRANSLATIONS: Record<string, string> = {
    'human': 'Humano',
    'elf': 'Elfo',
    'dwarf': 'Enano',
    'halfling': 'Mediano',
    'gnome': 'Gnomo',
    'half-elf': 'Semielfo',
    'half-orc': 'Semiorco',
    'dragonborn': 'Dracónido',
    'tiefling': 'Tiefling',
};

export const SUBRACE_TRANSLATIONS: Record<string, string> = {
    'high-elf': 'Alto Elfo',
    'wood-elf': 'Elfo del Bosque',
    'dark-elf': 'Elfo Oscuro (Drow)',
    'hill-dwarf': 'Enano de las Colinas',
    'mountain-dwarf': 'Enano de las Montañas',
    'lightfoot-halfling': 'Mediano Piesligeros',
    'stout-halfling': 'Mediano Fornido',
    'forest-gnome': 'Gnomo del Bosque',
    'rock-gnome': 'Gnomo de las Rocas',
};

// =============================================================================
// CLASS TRANSLATIONS (mostly covered by Spanish API)
// =============================================================================

export const CLASS_TRANSLATIONS: Record<string, string> = {
    'barbarian': 'Bárbaro',
    'bard': 'Bardo',
    'cleric': 'Clérigo',
    'druid': 'Druida',
    'fighter': 'Guerrero',
    'monk': 'Monje',
    'paladin': 'Paladín',
    'ranger': 'Explorador',
    'rogue': 'Pícaro',
    'sorcerer': 'Hechicero',
    'warlock': 'Brujo',
    'wizard': 'Mago',
};

export const SUBCLASS_TRANSLATIONS: Record<string, string> = {
    'champion': 'Campeón',
    'berserker': 'Berserker',
    'lore': 'Saber',
    'life': 'Vida',
    'land': 'Tierra',
    'thief': 'Ladrón',
    'evocation': 'Evocación',
    'fiend': 'Infernal',
    'draconic': 'Dracónico',
    'hunter': 'Cazador',
    'devotion': 'Devoción',
    'open-hand': 'Mano Abierta',
};

// =============================================================================
// ABILITY SCORE TRANSLATIONS
// =============================================================================

export const ABILITY_TRANSLATIONS: Record<string, { short: string; full: string }> = {
    'str': { short: 'FUE', full: 'Fuerza' },
    'dex': { short: 'DES', full: 'Destreza' },
    'con': { short: 'CON', full: 'Constitución' },
    'int': { short: 'INT', full: 'Inteligencia' },
    'wis': { short: 'SAB', full: 'Sabiduría' },
    'cha': { short: 'CAR', full: 'Carisma' },
};

// =============================================================================
// SKILL TRANSLATIONS
// =============================================================================

export const SKILL_TRANSLATIONS: Record<string, string> = {
    'acrobatics': 'Acrobacias',
    'animal-handling': 'Trato con Animales',
    'arcana': 'Arcanos',
    'athletics': 'Atletismo',
    'deception': 'Engaño',
    'history': 'Historia',
    'insight': 'Perspicacia',
    'intimidation': 'Intimidación',
    'investigation': 'Investigación',
    'medicine': 'Medicina',
    'nature': 'Naturaleza',
    'perception': 'Percepción',
    'performance': 'Interpretación',
    'persuasion': 'Persuasión',
    'religion': 'Religión',
    'sleight-of-hand': 'Juego de Manos',
    'stealth': 'Sigilo',
    'survival': 'Supervivencia',
};

// =============================================================================
// BACKGROUND DATA (SRD only has Acolyte, adding common ones)
// =============================================================================

export interface BackgroundData {
    index: string;
    name: string;
    description: string;
    skillProficiencies: string[];
    toolProficiencies: string[];
    languages: number;
    equipment: string[];
    feature: {
        name: string;
        description: string;
    };
}

export const BACKGROUNDS: BackgroundData[] = [
    {
        index: 'acolyte',
        name: 'Acólito',
        description: 'Has pasado tu vida al servicio de un templo dedicado a un dios específico o panteón de dioses.',
        skillProficiencies: ['insight', 'religion'],
        toolProficiencies: [],
        languages: 2,
        equipment: ['Símbolo sagrado', 'Libro de oraciones', '5 varitas de incienso', 'Vestimentas', '15 po'],
        feature: {
            name: 'Refugio de los Fieles',
            description: 'Como acólito, recibes el respeto de aquellos que comparten tu fe y puedes participar en ceremonias religiosas. Tú y tus compañeros podéis esperar recibir curación y cuidados gratuitos en un templo, santuario u otra presencia establecida de tu fe.',
        },
    },
    {
        index: 'criminal',
        name: 'Criminal',
        description: 'Eres un criminal experimentado con un historial de romper la ley.',
        skillProficiencies: ['deception', 'stealth'],
        toolProficiencies: ['Herramientas de ladrón', 'Juego de cartas'],
        languages: 0,
        equipment: ['Palanca', 'Ropa común oscura con capucha', '15 po'],
        feature: {
            name: 'Contacto Criminal',
            description: 'Tienes un contacto de confianza que actúa como tu enlace con una red de otros criminales.',
        },
    },
    {
        index: 'folk-hero',
        name: 'Héroe del Pueblo',
        description: 'Vienes de un origen humilde, pero estás destinado a mucho más.',
        skillProficiencies: ['animal-handling', 'survival'],
        toolProficiencies: ['Herramientas de artesano', 'Vehículos terrestres'],
        languages: 0,
        equipment: ['Herramientas de artesano', 'Pala', 'Olla de hierro', 'Ropa común', '10 po'],
        feature: {
            name: 'Hospitalidad Rústica',
            description: 'La gente común te ayudará a esconderte o descansar, a menos que hacerlo ponga en peligro sus vidas.',
        },
    },
    {
        index: 'noble',
        name: 'Noble',
        description: 'Entiendes la riqueza, el poder y el privilegio.',
        skillProficiencies: ['history', 'persuasion'],
        toolProficiencies: ['Juego de mesa'],
        languages: 1,
        equipment: ['Ropa fina', 'Anillo con sello', 'Pergamino de linaje', '25 po'],
        feature: {
            name: 'Posición de Privilegio',
            description: 'La gente tiende a pensar lo mejor de ti debido a tu nacimiento noble.',
        },
    },
    {
        index: 'sage',
        name: 'Sabio',
        description: 'Has pasado años aprendiendo la tradición del multiverso.',
        skillProficiencies: ['arcana', 'history'],
        toolProficiencies: [],
        languages: 2,
        equipment: ['Tinta', 'Pluma', 'Cuchillo pequeño', 'Carta de un colega fallecido', 'Ropa común', '10 po'],
        feature: {
            name: 'Investigador',
            description: 'Cuando intentas aprender o recordar información, sabes dónde y de quién puedes obtenerla.',
        },
    },
    {
        index: 'soldier',
        name: 'Soldado',
        description: 'La guerra ha sido tu vida durante tantos años como quieras recordar.',
        skillProficiencies: ['athletics', 'intimidation'],
        toolProficiencies: ['Juego de mesa', 'Vehículos terrestres'],
        languages: 0,
        equipment: ['Insignia de rango', 'Trofeo de enemigo caído', 'Dados', 'Ropa común', '10 po'],
        feature: {
            name: 'Rango Militar',
            description: 'Los soldados leales a tu antigua organización militar aún reconocen tu autoridad e influencia.',
        },
    },
    {
        index: 'hermit',
        name: 'Ermitaño',
        description: 'Viviste en reclusión, alejado de la sociedad.',
        skillProficiencies: ['medicine', 'religion'],
        toolProficiencies: ['Kit de herboristería'],
        languages: 1,
        equipment: ['Estuche con pergaminos', 'Manta de invierno', 'Ropa común', 'Kit de herboristería', '5 po'],
        feature: {
            name: 'Descubrimiento',
            description: 'Tu reclusión te dio acceso a un descubrimiento único y poderoso.',
        },
    },
    {
        index: 'outlander',
        name: 'Forastero',
        description: 'Creciste en la naturaleza, lejos de la civilización.',
        skillProficiencies: ['athletics', 'survival'],
        toolProficiencies: ['Instrumento musical'],
        languages: 1,
        equipment: ['Bastón', 'Trampa de caza', 'Trofeo de animal', 'Ropa de viajero', '10 po'],
        feature: {
            name: 'Errante',
            description: 'Tienes una memoria excelente para mapas y geografía.',
        },
    },
    {
        index: 'entertainer',
        name: 'Artista',
        description: 'Prosperas frente a una audiencia.',
        skillProficiencies: ['acrobatics', 'performance'],
        toolProficiencies: ['Kit de disfraz', 'Instrumento musical'],
        languages: 0,
        equipment: ['Instrumento musical', 'Favor de un admirador', 'Disfraz', '15 po'],
        feature: {
            name: 'Por Demanda Popular',
            description: 'Siempre puedes encontrar un lugar para actuar a cambio de alojamiento y comida.',
        },
    },
    {
        index: 'charlatan',
        name: 'Charlatán',
        description: 'Siempre has tenido facilidad para la gente.',
        skillProficiencies: ['deception', 'sleight-of-hand'],
        toolProficiencies: ['Kit de disfraz', 'Kit de falsificación'],
        languages: 0,
        equipment: ['Ropa fina', 'Kit de disfraz', 'Herramientas de estafa', '15 po'],
        feature: {
            name: 'Identidad Falsa',
            description: 'Has creado una segunda identidad que incluye documentación, contactos y disfraces.',
        },
    },
];

// =============================================================================
// EQUIPMENT ICONS
// =============================================================================

export const EQUIPMENT_ICONS: Record<string, string> = {
    // Weapons
    'weapon': '⚔️',
    'simple-weapons': '🗡️',
    'martial-weapons': '⚔️',
    'simple-melee-weapons': '🗡️',
    'simple-ranged-weapons': '🏹',
    'martial-melee-weapons': '⚔️',
    'martial-ranged-weapons': '🏹',
    'melee-weapons': '🗡️',
    'ranged-weapons': '🏹',

    // Specific weapons
    'longsword': '⚔️',
    'shortsword': '🗡️',
    'dagger': '🔪',
    'handaxe': '🪓',
    'battleaxe': '🪓',
    'greataxe': '🪓',
    'greatsword': '⚔️',
    'rapier': '🗡️',
    'scimitar': '🗡️',
    'warhammer': '🔨',
    'mace': '🔨',
    'quarterstaff': '🪄',
    'spear': '🔱',
    'javelin': '🔱',
    'trident': '🔱',
    'longbow': '🏹',
    'shortbow': '🏹',
    'crossbow-light': '🏹',
    'crossbow-heavy': '🏹',
    'crossbow-hand': '🏹',
    'sling': '🎯',
    'club': '🏏',
    'flail': '⛓️',
    'glaive': '🔱',
    'halberd': '🔱',
    'lance': '🔱',
    'morningstar': '🔨',
    'pike': '🔱',
    'whip': '🪢',

    // Armor
    'armor': '🛡️',
    'light-armor': '🥋',
    'medium-armor': '🦺',
    'heavy-armor': '🛡️',
    'shields': '🛡️',
    'shield': '🛡️',
    'leather-armor': '🥋',
    'studded-leather-armor': '🥋',
    'hide-armor': '🦺',
    'chain-shirt': '🦺',
    'scale-mail': '🦺',
    'breastplate': '🦺',
    'half-plate-armor': '🦺',
    'ring-mail': '🛡️',
    'chain-mail': '🛡️',
    'splint-armor': '🛡️',
    'plate-armor': '🛡️',
    'padded-armor': '🥋',

    // Adventuring Gear - Packs
    'adventuring-gear': '🎒',
    'standard-gear': '🎒',
    'equipment-packs': '🎒',
    'explorers-pack': '🎒',
    'dungeoneers-pack': '🎒',
    'burglars-pack': '🎒',
    'diplomats-pack': '🎒',
    'entertainers-pack': '🎒',
    'priests-pack': '🎒',
    'scholars-pack': '🎒',
    'backpack': '🎒',

    // Adventuring Gear - Rope & Climbing
    'rope': '🪢',
    'rope-hempen': '🪢',
    'rope-silk': '🪢',
    'hempen-rope-50-feet': '🪢',
    'silk-rope-50-feet': '🪢',
    'grappling-hook': '⚓',
    'piton': '📍',
    'climbing-kit': '🧗',
    'cuerda': '🪢',

    // Adventuring Gear - Light & Fire
    'torch': '🔦',
    'torches': '🔦',
    'antorcha': '🔦',
    'lantern': '🏮',
    'lantern-bullseye': '🏮',
    'lantern-hooded': '🏮',
    'lamp': '🏮',
    'candle': '🕯️',
    'candles': '🕯️',
    'tinderbox': '🔥',
    'yesquero': '🔥',
    'oil': '🛢️',
    'oil-flask': '🛢️',

    // Adventuring Gear - Food & Drink
    'rations': '🍖',
    'rations-1-day': '🍖',
    'raciones': '🍖',
    'waterskin': '💧',
    'odre': '💧',
    'flask': '🍶',
    'tankard': '🍺',
    'jug': '🏺',
    'pitcher': '🏺',
    'mess-kit': '🍽️',

    // Adventuring Gear - Camping & Survival
    'bedroll': '🛏️',
    'petate': '🛏️',
    'blanket': '🛏️',
    'manta': '🛏️',
    'tent': '⛺',
    'tent-two-person': '⛺',
    'tienda': '⛺',
    'sleeping-bag': '🛏️',
    'fishing-tackle': '🎣',
    'hunting-trap': '🪤',
    'trampa': '🪤',

    // Adventuring Gear - Containers
    'pouch': '👝',
    'bolsa': '👝',
    'sack': '👜',
    'saco': '👜',
    'chest': '📦',
    'cofre': '📦',
    'barrel': '🛢️',
    'barril': '🛢️',
    'basket': '🧺',
    'cesta': '🧺',
    'bottle': '🍶',
    'botella': '🍶',
    'case-crossbow-bolt': '📦',
    'case-map-or-scroll': '📜',
    'quiver': '🏹',
    'carcaj': '🏹',
    'vial': '🧪',

    // Adventuring Gear - Miscellaneous
    'mirror': '🪞',
    'mirror-steel': '🪞',
    'espejo': '🪞',
    'bell': '🔔',
    'campana': '🔔',
    'chain': '⛓️',
    'chain-10-feet': '⛓️',
    'cadena': '⛓️',
    'crowbar': '🔧',
    'palanca': '🔧',
    'hammer': '🔨',
    'hammer-sledge': '🔨',
    'martillo': '🔨',
    'lock': '🔒',
    'candado': '🔒',
    'manacles': '⛓️',
    'grilletes': '⛓️',
    'spyglass': '🔭',
    'catalejo': '🔭',
    'caltrops': '📍',
    'ball-bearings': '⚪',
    'magnifying-glass': '🔍',
    'lupa': '🔍',
    'hourglass': '⏳',
    'reloj': '⏳',
    'ink': '🖋️',
    'ink-bottle': '🖋️',
    'tinta': '🖋️',
    'ink-pen': '🖊️',
    'pluma': '🖊️',
    'paper': '📄',
    'papel': '📄',
    'parchment': '📜',
    'pergamino': '📜',
    'sealing-wax': '🔴',
    'signet-ring': '💍',
    'book': '📖',
    'libro': '📖',
    'clothes': '👔',
    'ropa': '👔',

    // Clothing
    'clothes-common': '👕',
    'clothes-costume': '🎭',
    'clothes-fine': '👔',
    'clothes-travelers': '🧥',
    'robe': '👘',
    'robes': '👘',
    'vestiduras': '👘',
    'cloak': '🧥',
    'capa': '🧥',
    'boots': '🥾',
    'botas': '🥾',
    'hat': '🎩',
    'sombrero': '🎩',
    'gloves': '🧤',
    'guantes': '🧤',

    // Tools
    'tools': '🔧',
    'herramientas': '🔧',
    'artisans-tools': '🔧',
    'gaming-sets': '🎲',
    'musical-instruments': '🎵',
    'kits': '🧰',
    'other-tools': '🔧',
    'thieves-tools': '🔓',
    'smiths-tools': '⚒️',
    'masons-tools': '🧱',
    'carpenters-tools': '🪚',
    'leatherworkers-tools': '🧵',
    'weavers-tools': '🧶',
    'potters-tools': '🏺',
    'jewelers-tools': '💎',
    'tinkers-tools': '🔩',
    'calligraphers-supplies': '🖋️',
    'painters-supplies': '🎨',
    'navigators-tools': '🧭',
    'cartographers-tools': '🗺️',

    // Cooking & Food Utensils
    'cooks-utensils': '🍳',
    'cooking-utensils': '🍳',
    'utensilios': '🍳',
    'cocina': '🍳',
    'brewers-supplies': '🍺',
    'alchemists-supplies': '⚗️',

    // Herbalism & Medicine
    'herbalism-kit': '🌿',
    'healers-kit': '🩹',
    'antitoxin': '🧪',
    'potion-of-healing': '❤️‍🩹',
    'medicina': '🩹',
    'vendas': '🩹',

    // Musical Instruments
    'lute': '🪕',
    'laud': '🪕',
    'flute': '🎶',
    'flauta': '🎶',
    'drum': '🥁',
    'tambor': '🥁',
    'horn': '📯',
    'cuerno': '📯',
    'bagpipes': '🎵',
    'gaita': '🎵',
    'dulcimer': '🎵',
    'lyre': '🎵',
    'lira': '🎵',
    'pan-flute': '🎶',
    'shawm': '🎺',
    'viol': '🎻',
    'viola': '🎻',

    // Games
    'dice-set': '🎲',
    'dados': '🎲',
    'playing-card-set': '🃏',
    'cartas': '🃏',
    'dragonchess-set': '♟️',
    'ajedrez': '♟️',
    'three-dragon-ante-set': '🃏',

    // Focus items
    'arcane-foci': '🔮',
    'arcane-focus': '🔮',
    'druidic-foci': '🌿',
    'druidic-focus': '🌿',
    'holy-symbols': '✝️',
    'holy-symbol': '✝️',
    'simbolo': '✝️',
    'component-pouch': '👝',
    'spellbook': '📕',
    'grimorio': '📕',
    'crystal': '💎',
    'cristal': '💎',
    'orb': '🔮',
    'wand': '🪄',
    'varita': '🪄',
    'rod': '🪄',
    'staff': '🪄',
    'baston': '🪄',

    // Religious Items
    'holy-water': '💧',
    'agua-bendita': '💧',
    'incense': '🕯️',
    'incienso': '🕯️',
    'amulet': '📿',
    'amuleto': '📿',
    'emblem': '🏅',
    'emblema': '🏅',
    'reliquary': '📦',
    'relicario': '📦',
    'prayer-book': '📖',
    'oraciones': '📖',

    // Magic items
    'potion': '🧪',
    'pocion': '🧪',
    'scroll': '📜',
    'ring': '💍',
    'anillo': '💍',
    'wondrous-items': '✨',
    'magic-items': '✨',

    // Ammunition
    'ammunition': '➤',
    'municion': '➤',
    'arrow': '➤',
    'arrows': '➤',
    'arrows-20': '➤',
    'flechas': '➤',
    'crossbow-bolt': '➤',
    'crossbow-bolts': '➤',
    'crossbow-bolts-20': '➤',
    'virotes': '➤',
    'sling-bullets': '⚪',
    'blowgun-needles': '📍',

    // Mounts and vehicles
    'mounts-and-vehicles': '🐴',
    'mounts-and-other-animals': '🐴',
    'land-vehicles': '🛒',
    'waterborne-vehicles': '⛵',
    'tack-harness-and-drawn-vehicles': '🐴',
    'saddle': '🐴',
    'silla': '🐴',
    'bit-and-bridle': '🐴',
    'caballo': '🐴',
    'mula': '🐴',
    'burro': '🐴',

    // Money & Valuables
    'gold': '🪙',
    'oro': '🪙',
    'silver': '🪙',
    'plata': '🪙',
    'copper': '🪙',
    'cobre': '🪙',
    'platinum': '🪙',
    'gem': '💎',
    'gema': '💎',
    'jewel': '💎',
    'joya': '💎',

    // Default
    'default': '📦',
};


export function getEquipmentIcon(category: string): string {
    // Try exact match first
    if (EQUIPMENT_ICONS[category]) {
        return EQUIPMENT_ICONS[category];
    }

    // Try partial match
    for (const [key, icon] of Object.entries(EQUIPMENT_ICONS)) {
        if (category.toLowerCase().includes(key.toLowerCase())) {
            return icon;
        }
    }

    return EQUIPMENT_ICONS['default'];
}

// =============================================================================
// LANGUAGE TRANSLATIONS
// =============================================================================

export const LANGUAGE_TRANSLATIONS: Record<string, string> = {
    'common': 'Común',
    'dwarvish': 'Enano',
    'elvish': 'Élfico',
    'giant': 'Gigante',
    'gnomish': 'Gnomo',
    'goblin': 'Goblin',
    'halfling': 'Mediano',
    'orc': 'Orco',
    'abyssal': 'Abisal',
    'celestial': 'Celestial',
    'draconic': 'Dracónico',
    'deep-speech': 'Habla Profunda',
    'infernal': 'Infernal',
    'primordial': 'Primordial',
    'sylvan': 'Silvano',
    'undercommon': 'Infracomún',
};

// =============================================================================
// TRAIT TRANSLATIONS WITH DESCRIPTIONS (for tooltips)
// =============================================================================

export interface TraitInfo {
    name: string;
    description: string;
}

export const TRAIT_TRANSLATIONS: Record<string, TraitInfo> = {
    // Elf traits
    'darkvision': {
        name: 'Visión en la Oscuridad',
        description: 'Puedes ver en luz tenue a 60 pies de ti como si fuera luz brillante, y en oscuridad como si fuera luz tenue. No puedes discernir colores en la oscuridad, solo tonos de gris.',
    },
    'fey-ancestry': {
        name: 'Linaje Feérico',
        description: 'Tienes ventaja en tiradas de salvación contra ser encantado, y la magia no puede hacerte dormir.',
    },
    'trance': {
        name: 'Trance',
        description: 'Los elfos no necesitan dormir. En su lugar, meditan profundamente, permaneciendo semiconscientes, durante 4 horas al día. Después de descansar de esta manera, obtienes los mismos beneficios que un humano obtendría de 8 horas de sueño.',
    },
    'keen-senses': {
        name: 'Sentidos Agudos',
        description: 'Tienes competencia en la habilidad de Percepción.',
    },
    'elf-weapon-training': {
        name: 'Entrenamiento con Armas Élficas',
        description: 'Tienes competencia con espadas largas, espadas cortas, arcos largos y arcos cortos.',
    },
    'cantrip': {
        name: 'Truco',
        description: 'Conoces un truco de tu elección de la lista de conjuros de mago. Inteligencia es tu característica de lanzamiento para este truco.',
    },
    'extra-language': {
        name: 'Idioma Adicional',
        description: 'Puedes hablar, leer y escribir un idioma adicional de tu elección.',
    },
    'fleet-of-foot': {
        name: 'Pies Ligeros',
        description: 'Tu velocidad base de caminar es de 35 pies.',
    },
    'mask-of-the-wild': {
        name: 'Máscara de lo Salvaje',
        description: 'Puedes intentar esconderte incluso cuando solo estás ligeramente oculto por follaje, lluvia intensa, nieve, neblina u otros fenómenos naturales.',
    },
    'superior-darkvision': {
        name: 'Visión en Oscuridad Superior',
        description: 'Tu visión en la oscuridad tiene un alcance de 120 pies.',
    },
    'sunlight-sensitivity': {
        name: 'Sensibilidad a la Luz Solar',
        description: 'Tienes desventaja en tiradas de ataque y pruebas de Sabiduría (Percepción) que dependan de la vista cuando tú, el objetivo de tu ataque o lo que estés intentando percibir esté bajo luz solar directa.',
    },
    'drow-magic': {
        name: 'Magia Drow',
        description: 'Conoces el truco luces danzantes. Al alcanzar el nivel 3, puedes lanzar el conjuro fuego feérico una vez al día. Al alcanzar el nivel 5, también puedes lanzar oscuridad una vez al día. Carisma es tu característica de lanzamiento para estos conjuros.',
    },
    'drow-weapon-training': {
        name: 'Entrenamiento con Armas Drow',
        description: 'Tienes competencia con estoques, espadas cortas y ballestas de mano.',
    },

    // Dwarf traits
    'dwarven-resilience': {
        name: 'Resistencia Enana',
        description: 'Tienes ventaja en tiradas de salvación contra veneno y tienes resistencia al daño de veneno.',
    },
    'dwarven-combat-training': {
        name: 'Entrenamiento de Combate Enano',
        description: 'Tienes competencia con hachas de batalla, hachas de mano, martillos ligeros y martillos de guerra.',
    },
    'tool-proficiency': {
        name: 'Competencia con Herramientas',
        description: 'Tienes competencia con las herramientas de artesano de tu elección: herramientas de herrero, suministros de cervecero o herramientas de albañil.',
    },
    'stonecunning': {
        name: 'Conocimiento de la Piedra',
        description: 'Siempre que hagas una prueba de Inteligencia (Historia) relacionada con el origen de un trabajo en piedra, se te considera competente en la habilidad de Historia y añades el doble de tu bonificador de competencia a la prueba.',
    },
    'dwarven-toughness': {
        name: 'Dureza Enana',
        description: 'Tu máximo de puntos de golpe aumenta en 1, y aumenta en 1 cada vez que ganas un nivel.',
    },
    'dwarven-armor-training': {
        name: 'Entrenamiento con Armadura Enana',
        description: 'Tienes competencia con armadura ligera y media.',
    },

    // Halfling traits
    'lucky': {
        name: 'Afortunado',
        description: 'Cuando sacas un 1 en el d20 para una tirada de ataque, prueba de característica o tirada de salvación, puedes volver a tirar el dado y debes usar el nuevo resultado.',
    },
    'brave': {
        name: 'Valiente',
        description: 'Tienes ventaja en tiradas de salvación contra estar asustado.',
    },
    'halfling-nimbleness': {
        name: 'Agilidad de Mediano',
        description: 'Puedes moverte a través del espacio de cualquier criatura que sea de un tamaño mayor que el tuyo.',
    },
    'naturally-stealthy': {
        name: 'Sigiloso por Naturaleza',
        description: 'Puedes intentar esconderte incluso cuando solo estás oculto por una criatura que sea al menos un tamaño mayor que tú.',
    },
    'stout-resilience': {
        name: 'Resistencia Fornida',
        description: 'Tienes ventaja en tiradas de salvación contra veneno y tienes resistencia al daño de veneno.',
    },

    // Gnome traits
    'gnome-cunning': {
        name: 'Astucia Gnómica',
        description: 'Tienes ventaja en todas las tiradas de salvación de Inteligencia, Sabiduría y Carisma contra magia.',
    },
    'natural-illusionist': {
        name: 'Ilusionista Natural',
        description: 'Conoces el truco ilusión menor. Inteligencia es tu característica de lanzamiento para este truco.',
    },
    'speak-with-small-beasts': {
        name: 'Hablar con Bestias Pequeñas',
        description: 'Mediante sonidos y gestos, puedes comunicar ideas simples a bestias Pequeñas o más pequeñas.',
    },
    'artificers-lore': {
        name: 'Saber del Artífice',
        description: 'Siempre que hagas una prueba de Inteligencia (Historia) relacionada con objetos mágicos, objetos alquímicos o dispositivos tecnológicos, puedes añadir el doble de tu bonificador de competencia.',
    },
    'tinker': {
        name: 'Manitas',
        description: 'Tienes competencia con herramientas de manitas. Usando estas herramientas, puedes pasar 1 hora y gastar materiales por valor de 10 po para construir un pequeño dispositivo mecánico.',
    },

    // Half-Elf traits
    'skill-versatility': {
        name: 'Versatilidad en Habilidades',
        description: 'Ganas competencia en dos habilidades de tu elección.',
    },

    // Half-Orc traits
    'menacing': {
        name: 'Amenazador',
        description: 'Ganas competencia en la habilidad de Intimidación.',
    },
    'relentless-endurance': {
        name: 'Resistencia Implacable',
        description: 'Cuando te reducen a 0 puntos de golpe pero no mueres directamente, puedes quedar a 1 punto de golpe en su lugar. No puedes usar este rasgo de nuevo hasta que termines un descanso largo.',
    },
    'savage-attacks': {
        name: 'Ataques Salvajes',
        description: 'Cuando consigues un golpe crítico con un ataque cuerpo a cuerpo con arma, puedes tirar uno de los dados de daño del arma una vez adicional y añadirlo al daño extra del crítico.',
    },

    // Dragonborn traits
    'draconic-ancestry': {
        name: 'Linaje Dracónico',
        description: 'Tienes ancestros dracónicos. Elige un tipo de dragón de la tabla de Linaje Dracónico. Tu arma de aliento y resistencia al daño están determinadas por el tipo de dragón.',
    },
    'breath-weapon': {
        name: 'Arma de Aliento',
        description: 'Puedes usar tu acción para exhalar energía destructiva. Tu linaje dracónico determina el tamaño, forma y tipo de daño de la exhalación.',
    },
    'damage-resistance': {
        name: 'Resistencia al Daño',
        description: 'Tienes resistencia al tipo de daño asociado con tu linaje dracónico.',
    },

    // Tiefling traits
    'hellish-resistance': {
        name: 'Resistencia Infernal',
        description: 'Tienes resistencia al daño de fuego.',
    },
    'infernal-legacy': {
        name: 'Legado Infernal',
        description: 'Conoces el truco taumaturgia. Al alcanzar el nivel 3, puedes lanzar el conjuro fuego infernal como conjuro de 2º nivel una vez al día. Al alcanzar el nivel 5, también puedes lanzar oscuridad una vez al día. Carisma es tu característica de lanzamiento para estos conjuros.',
    },

    // Human traits (none specific)

    // Generic/fallback
    'default': {
        name: 'Rasgo',
        description: 'Rasgo racial especial.',
    },
};

export function getTraitInfo(traitIndex: string): TraitInfo {
    // Try exact match
    if (TRAIT_TRANSLATIONS[traitIndex]) {
        return TRAIT_TRANSLATIONS[traitIndex];
    }

    // Try partial match
    const lowerIndex = traitIndex.toLowerCase();
    for (const [key, info] of Object.entries(TRAIT_TRANSLATIONS)) {
        if (lowerIndex.includes(key) || key.includes(lowerIndex)) {
            return info;
        }
    }

    return { name: traitIndex, description: 'Rasgo racial especial.' };
}

// =============================================================================
// SIZE TRANSLATIONS
// =============================================================================

export const SIZE_TRANSLATIONS: Record<string, string> = {
    'Tiny': 'Diminuto',
    'Small': 'Pequeño',
    'Medium': 'Mediano',
    'Large': 'Grande',
    'Huge': 'Enorme',
    'Gargantuan': 'Gargantuesco',
};

// =============================================================================
// DRAGONBORN ANCESTRY
// =============================================================================

export interface DragonAncestry {
    dragon: string;
    damageType: string;
    breathWeapon: string;
}

export const DRAGON_ANCESTRIES: DragonAncestry[] = [
    { dragon: 'Negro', damageType: 'Ácido', breathWeapon: 'Línea de 5 por 30 pies (TS Des.)' },
    { dragon: 'Azul', damageType: 'Relámpago', breathWeapon: 'Línea de 5 por 30 pies (TS Des.)' },
    { dragon: 'Latón', damageType: 'Fuego', breathWeapon: 'Línea de 5 por 30 pies (TS Des.)' },
    { dragon: 'Bronce', damageType: 'Relámpago', breathWeapon: 'Línea de 5 por 30 pies (TS Des.)' },
    { dragon: 'Cobre', damageType: 'Ácido', breathWeapon: 'Línea de 5 por 30 pies (TS Des.)' },
    { dragon: 'Oro', damageType: 'Fuego', breathWeapon: 'Cono de 15 pies (TS Con.)' },
    { dragon: 'Verde', damageType: 'Veneno', breathWeapon: 'Cono de 15 pies (TS Con.)' },
    { dragon: 'Rojo', damageType: 'Fuego', breathWeapon: 'Cono de 15 pies (TS Des.)' },
    { dragon: 'Plata', damageType: 'Frío', breathWeapon: 'Cono de 15 pies (TS Con.)' },
    { dragon: 'Blanco', damageType: 'Frío', breathWeapon: 'Cono de 15 pies (TS Con.)' },
];

// =============================================================================
// POINT BUY COSTS
// =============================================================================

export const POINT_BUY_COSTS: Record<number, number> = {
    8: 0,
    9: 1,
    10: 2,
    11: 3,
    12: 4,
    13: 5,
    14: 7,
    15: 9,
};

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

export const POINT_BUY_TOTAL = 27;

// =============================================================================
// UI LABELS
// =============================================================================

export const UI_LABELS = {
    // Steps
    step1: 'Nombre y Raza',
    step2: 'Clase',
    step3: 'Características',
    step4: 'Trasfondo',
    step5: 'Equipo',
    step6: 'Resumen',

    // General
    next: 'Siguiente',
    previous: 'Anterior',
    save: 'Guardar Personaje',
    reset: 'Reiniciar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',

    // Character info
    characterName: 'Nombre del Personaje',
    race: 'Raza',
    subrace: 'Subraza',
    class: 'Clase',
    level: 'Nivel',
    background: 'Trasfondo',

    // Ability scores
    abilityScores: 'Puntuaciones de Característica',
    pointBuy: 'Compra de Puntos',
    standardArray: 'Distribución Estándar',
    pointsRemaining: 'Puntos Restantes',

    // Character sheet
    hitPoints: 'Puntos de Golpe',
    armorClass: 'Clase de Armadura',
    speed: 'Velocidad',
    proficiencyBonus: 'Bonificador de Competencia',
    savingThrows: 'Tiradas de Salvación',
    skills: 'Habilidades',
    proficiencies: 'Competencias',
    equipment: 'Equipo',
    features: 'Rasgos y Capacidades',
    languages: 'Idiomas',
    traits: 'Rasgos Raciales',

    // Equipment
    weapons: 'Armas',
    armor: 'Armadura',
    gear: 'Equipo de Aventurero',

    // Placeholders
    selectRace: 'Selecciona una raza',
    selectSubrace: 'Selecciona una subraza',
    selectClass: 'Selecciona una clase',
    selectBackground: 'Selecciona un trasfondo',
    enterName: 'Introduce el nombre de tu personaje',

    // Messages
    loadingRaces: 'Cargando razas disponibles...',
    loadingClasses: 'Cargando clases disponibles...',
    loadingEquipment: 'Cargando equipo...',
    errorLoading: 'Error al cargar los datos. Por favor, recarga la página.',
    characterSaved: '¡Personaje guardado correctamente!',

    // Validation
    nameRequired: 'El nombre del personaje es obligatorio',
    raceRequired: 'Debes seleccionar una raza',
    classRequired: 'Debes seleccionar una clase',
    backgroundRequired: 'Debes seleccionar un trasfondo',
};

// =============================================================================
// CLASS ICONS
// =============================================================================

export const CLASS_ICONS: Record<string, string> = {
    'barbarian': '🪓',
    'bard': '🎵',
    'cleric': '✝️',
    'druid': '🌿',
    'fighter': '⚔️',
    'monk': '👊',
    'paladin': '🛡️',
    'ranger': '🏹',
    'rogue': '🗡️',
    'sorcerer': '🔥',
    'warlock': '👁️',
    'wizard': '🔮',
};

// =============================================================================
// RACE ICONS
// =============================================================================

export const RACE_ICONS: Record<string, string> = {
    'human': '👤',
    'elf': '🧝',
    'dwarf': '⛏️',
    'halfling': '🥧',
    'gnome': '🔧',
    'half-elf': '🧝‍♂️',
    'half-orc': '💪',
    'dragonborn': '🐉',
    'tiefling': '😈',
};
