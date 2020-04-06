import { AppliedEffect } from './../Ability/Effect/AppliedEffect';
import { AbilityRequirements } from './../Ability/Ability';
import { EffectType } from '../Ability/Effect/Effect';


/**
 * True if the CombatTeam can use a particular ability.
 */
export function canUseAbility(
    actor: { HP: number, mana: number, statusEffects: AppliedEffect[] },
    defendCharges: number,
    requirements: AbilityRequirements): boolean {

    if (!actor) {
        return false;
    }

    if (actor.statusEffects.some(effect => effect.type === EffectType.STUN)) {
        return false;
    }

    if (!requirements) {
        return true;
    }

    const hpCost = requirements.hpCost || 0;
    const manaCost = requirements.manaCost || 0;
    const defendCost = requirements.defendCost || 0;
    return (defendCharges > defendCost) && (actor.HP > hpCost) && (actor.mana >= manaCost);
}