import { ElementCategory } from './../../Element/Elements';
import { Elements } from '../../Element/Elements';
import { DamageCalculation, CombatTeam } from '../models';
import { abilityBonusMultiplier } from './abilitybonus/abilityBonus';
import { categoryMultiplier } from './categoryMultiplier';
import { calcEffectivenessBonus } from './effectivenessBonus';
import { calcSameTypeBonus } from './sameTypeBonus';
import { sumStat } from '../calculateStatStages';
import { AbilityBonus } from './abilitybonus/Bonus';
import { AppliedEffect } from '../../Ability/Effect/AppliedEffect';

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
        isBlocked: false
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
    const damageReduction = aggregateDamageReduction(targetTeam);

    const damage = [
        damageMultiplier,
        effectivenessBonus,
        categoryMultiplier(actor, target, elementCategory),
        sameTypeBonus,
        abilityBonus,
        (1 - damageReduction)
    ].reduce((acc, current) => acc * current, baseDamage);

    return {
        ...result,
        effectivenessBonus,
        sameTypeBonus,
        abilityBonus,
        finalDamage: Math.ceil(damage),
        isBlocked: damageReduction > 0
    };
}

function aggregateDamageReduction(team): number {
    if (!team.active) {
        return 0;
    }

    const teamActiveEffects = team.active ? team.active.statusEffects : [];
    const statusEffects = team.statusEffects.concat(teamActiveEffects);
    const sum = statusEffects.reduce((acc, { damageReduction = 0 }) => acc + damageReduction, 0);
    return Math.min(1, sum); // Damage reduction can't go above 1 (100%).
}