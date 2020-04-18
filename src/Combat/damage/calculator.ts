import { Elements } from '../../Element/Elements';
import { abilityBonusMultiplier } from '../abilitybonus/abilityBonus';
import { AbilityBonus } from '../abilitybonus/Bonus';
import { AppliedEffect } from './../../Ability/Effect/AppliedEffect';
import { ElementCategory } from './../../Element/Elements';
import { getCategoryMultiplier } from './categoryMultiplier';
import { calcEffectivenessBonus } from './effectivenessBonus';
import { calcSameTypeBonus } from './sameTypeBonus';

export interface DamageCalculation {
    effectivenessMultiplier: number;
    sameTypeMultiplier: number;
    totalDamage: number;
    finalDamage: number;
    overkill: number;
    isAttack: boolean;
    // This is if the damage was reduced by a global damage reduction, such as Stonehide or Frost Barrier.
    isBlocked: boolean;
}

/**
 * This is a subset of a CombatElemental containing the relevant fields.
 */
interface Character {
    elements: Elements[];
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
    // These should also include team status effects.
    statusEffects: AppliedEffect[];
}

export interface DamageSource {
    elements: Elements[];
    elementCategory: ElementCategory;
    damageMultiplier: number;
    damageBonus?: AbilityBonus;
    isAbility: boolean;
}

/**
 * Physical/magic attack and defence stats are a sum of the active combat elemental's base stats
 * plus the aggregation of the stat-increasing status effects, including *effects applied to the CombatTeam.*
 */
export function calculateDamage(
    actor: Character,
    target: Character | null,
    damageSource: DamageSource
): DamageCalculation {
    const { elements, elementCategory, damageMultiplier, damageBonus, isAbility } = damageSource;

    const result = {
        effectivenessMultiplier: 0,
        sameTypeMultiplier: 0,
        totalDamage: 0,
        finalDamage: 0,
        overkill: 0,
        isAttack: isAbility && damageMultiplier > 0,
        isBlocked: false
    };

    if (!damageMultiplier || !target) {
        // This ability does no damage.
        return result;
    }

    const effectivenessMultiplier = calcEffectivenessBonus(elements, target.elements);
    const abilityBonus = abilityBonusMultiplier(actor, target, damageBonus); // Actor and target are incomplete for this calculation..
    const sameTypeMultiplier = calcSameTypeBonus(actor.elements, elements);
    const baseDamage = 5;
    const damageReduction = aggregate(target.statusEffects, 'damageReduction');
    const categoryMultiplier = getCategoryMultiplier(
        {
            physicalAtt: sumStats(actor, 'physicalAtt'),
            magicAtt: sumStats(actor, 'magicAtt'),
        },
        {
            physicalDef: sumStats(target, 'physicalDef'),
            magicDef: sumStats(target, 'magicDef')
        },
        elementCategory
    );

    const totalDamage = Math.ceil([
        damageMultiplier,
        effectivenessMultiplier,
        categoryMultiplier,
        sameTypeMultiplier,
        abilityBonus,
        1 - damageReduction
    ].reduce((acc, current) => acc * current, baseDamage));

    const overkill = Math.max(0, totalDamage - target.HP);

    return {
        ...result,
        effectivenessMultiplier,
        sameTypeMultiplier,
        overkill,
        totalDamage,
        finalDamage: totalDamage - overkill,
        isBlocked: damageReduction > 0
    };
}

function sumStats(character: Character, stat: string): number {
    return (character[stat] || 0) + aggregate(character.statusEffects, stat);
}

function aggregate(statusEffects: AppliedEffect[], prop: string): number {
    const sum = statusEffects.reduce((acc, effect) => acc + (effect[prop] || 0), 0);
    return Math.min(1, sum); // Can't go above 1 (100%).
}