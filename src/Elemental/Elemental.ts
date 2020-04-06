import { getLearned } from '../Ability/helpers';
import { MAX_ACTIVE_SKILLS } from '../constants';
import { Elements } from '../Element/Elements';
import { Species } from './Species';
import uuid = require('uuid');

export interface Elemental {
    level: number;
    species: string; // id
    speciesName: string;
    id: string; // unique id for this Elemental
    elements: Elements[];
    leftIcon: string;
    rightIcon: string;
    name: string;
    maxHP: number;
    physicalAtt: number;
    magicAtt: number;
    physicalDef: number;
    magicDef: number;
    speed: number;
    maxMana: number;
    exp: number;
    startingMana: number;
    manaPerRoundActive: number;
    manaPerRoundInactive: number;
    activeAbilities: string[]; // ids
    activePassives: string[]; // ids
}

function makeElemental(species: Species, level: number = 1): Elemental {
    return {
        ...species,
        elements: species.elements.slice(),
        species: species.id,
        speciesName: species.name,
        name: species.name,
        level,
        id: uuid.v4(),
        maxMana: 20,
        exp: 0,
        startingMana: 3,
        manaPerRoundActive: 3,
        manaPerRoundInactive: 1,
        activeAbilities: getLearned(species.abilities, level).slice(0, MAX_ACTIVE_SKILLS),
        activePassives: [],
        ...species.statGrowth // TODO
    };
}

