import { AbilityHealing } from '../../Ability/Ability';
import { abilityBonusMultiplier } from '../abilitybonus/abilityBonus';
import { AppliedEffect } from './../../Ability/Effect/AppliedEffect';

export interface HealingCalculation {
    totalHealing: number;
    overHealing: number;
    finalHealing: number;
}

/**
 * This is a subset of a CombatElemental containing the relevant fields.
 */
interface Character {
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

export function calculateHealing(
    actor: Character | null,
    target: Character | null,
    healingSource?: AbilityHealing
): HealingCalculation {
    const result = {
        totalHealing: 0,
        overHealing: 0,
        finalHealing: 0
    };

    if (!healingSource || !target) {
        // This ability does no healing.
        return result;
    }

    const { stat, amount, calculationType, bonus, on } = healingSource;
    let baseHealing = 0;
    if (calculationType === 'flat') {
        baseHealing = amount;
    } else if (calculationType === 'percentage') {
        if (on === 'actor' && actor) {
            baseHealing = (actor[stat] || 0) * amount;
        } else if (on === 'target') {
            baseHealing = (target[stat] || 0) * amount;
        }
    }

    if (!baseHealing) {
        return result;
    }

    const healingDone = aggregate(actor.statusEffects, 'healingDone');
    const healingTaken = aggregate(target.statusEffects, 'healingTaken');
    const abilityBonus = abilityBonusMultiplier(actor, target, bonus);

    const totalHealing = Math.ceil([
        baseHealing,
        1 + healingDone,
        1 + healingTaken,
        abilityBonus
    ].reduce((acc, cur) => acc * cur));

    const missingHealth = target.maxHP - target.HP;
    const overHealing = Math.max(0, totalHealing - missingHealth);

    return {
        totalHealing,
        finalHealing: totalHealing - overHealing,
        overHealing
    };
}

function aggregate(statusEffects: AppliedEffect[], prop: string): number {
    const sum = statusEffects.reduce((acc, effect) => acc + (effect[prop] || 0), 0);
    return Math.min(1, sum); // Can't go above 1 (100%).
}