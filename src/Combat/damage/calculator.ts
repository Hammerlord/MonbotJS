import { ElementCategory } from './../../Element/Elements';
import { Elements } from '../../Element/Elements';
import { DamageCalculation, CombatTeam } from '../models';
import { abilityBonusMultiplier } from './abilitybonus/abilityBonus';
import { categoryMultiplier } from './categoryMultiplier';
import { calcEffectivenessBonus } from './effectivenessBonus';
import { calcSameTypeBonus } from './sameTypeBonus';
import { sumStat } from '../calculateStatStages';
import { AbilityBonus } from './abilitybonus/Bonus';

interface Actor {
    elements: Elements[];
    physicalAtt: number;
    magicAtt: number;
}

interface Target {
    elements: Elements[];
    physicalDef: number;
    magicDef: number;
}

export interface DamageSource {
    elements: Elements[];
    elementCategory: ElementCategory;
    damageMultiplier: number;
    damageBonus?: AbilityBonus;
}

/**
 * Physical/magic attack and defence stats are a sum of the active combat elemental's base stats
 * plus the aggregation of the stat-increasing status effects, including *effects applied to the CombatTeam.*
 */
export function calculateDamage(
    actingTeam: CombatTeam,
    targetTeam: CombatTeam | null,
    damageSource: DamageSource
): DamageCalculation {

    const result = {
        effectivenessBonus: 0,
        sameTypeBonus: 0,
        abilityBonus: 0,
        finalDamage: 0,
        isDefended: false, // TODO true if the target has Defend up.
        isBlocked: false, // TODO true if the target has a damage reduction
    };

    const { elements, elementCategory, damageMultiplier, damageBonus } = damageSource;
    if (!damageMultiplier || !targetTeam || !targetTeam.active) {
        // This ability does no damage.
        return result;
    }

    const actor = {
        elements: actingTeam.active.elements,
        physicalAtt: sumStat(actingTeam, 'physicalAtt'),
        magicAtt: sumStat(actingTeam, 'magicAtt')
    } as Actor;

    const target = {
        elements: targetTeam.active.elements,
        physicalDef: sumStat(targetTeam, 'physicalDef'),
        magicDef: sumStat(targetTeam, 'magicDef')
    } as Target;

    const effectivenessBonus = calcEffectivenessBonus(elements, target.elements);
    const abilityBonus = abilityBonusMultiplier(actor, target, damageBonus);
    const sameTypeBonus = calcSameTypeBonus(actor.elements, elements);
    const baseDamage = 5;

    const damage = [
        damageMultiplier,
        effectivenessBonus,
        categoryMultiplier(actor, target, elementCategory),
        sameTypeBonus,
        abilityBonus
    ].reduce((acc, current) => acc * current, baseDamage);

    return {
        ...result,
        effectivenessBonus,
        sameTypeBonus,
        abilityBonus,
        finalDamage: Math.ceil(damage)
    };
}