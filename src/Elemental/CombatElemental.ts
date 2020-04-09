import { AppliedEffect, makeAppliedEffectFromId } from './../Ability/Effect/AppliedEffect';
import { Elements } from './../Element/Elements';
import { Elemental } from './Elemental';

export interface CombatElemental {
    level: number;
    species: string; // ID
    id: string; // Elemental ID
    elements: Elements[];
    leftIcon: string;
    rightIcon: string;
    name: string;
    /** These are base stats, ie. before buffs. */
    HP: number;
    mana: number;
    maxHP: number;
    maxMana: number;
    physicalAtt: number;
    magicAtt: number;
    physicalDef: number;
    magicDef: number;
    speed: number;
    manaPerRoundActive: number;
    manaPerRoundInactive: number;
    statusEffects: AppliedEffect[];
    abilities: string[];
}

export function makeCombatElemental(elemental: Elemental): CombatElemental {
    const {
        id,
        level,
        elements,
        name,
        species,
        maxHP,
        startingMana,
        maxMana,
        manaPerRoundActive,
        manaPerRoundInactive,
        leftIcon,
        rightIcon,
        physicalAtt,
        magicAtt,
        physicalDef,
        magicDef,
        speed
    } = elemental;

    return {
        id,
        level,
        name,
        species,
        maxHP,
        maxMana,
        manaPerRoundActive,
        manaPerRoundInactive,
        leftIcon,
        rightIcon,
        physicalAtt,
        magicAtt,
        physicalDef,
        magicDef,
        speed,
        HP: maxHP,
        mana: startingMana,
        elements: elements.slice(),
        statusEffects: elemental.activePassives.map(id => makeAppliedEffectFromId(id, elemental.id)),
        abilities: elemental.activeAbilities.slice()
    };
}
