import { CombatElemental } from './../../Elemental/CombatElemental';
import { abilityBonusMultiplier } from './abilitybonus/abilityBonus';
import { categoryMultiplier } from './categoryMultiplier';
import { calcEffectivenessBonus } from './effectivenessBonus';
import { calcSameTypeBonus } from './sameTypeBonus';
import { DamageCalculation } from '../models';

export function calculateDamage(
    actor: CombatElemental,
    target: CombatElemental | null,
    {
        elements,
        elementCategory,
        damageMultiplier,
        damageBonus
    }
): DamageCalculation {
    const result = {
        effectivenessBonus: 0,
        sameTypeBonus: 0,
        abilityBonus: 0,
        finalDamage: 0,
        isDefended: false // TODO true if the target has Defend up.
    };

    if (!damageMultiplier || !target) {
        // This ability does no damage.
        return result;
    }

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