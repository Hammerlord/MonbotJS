import { AbilityBonus, ConditionType } from './Bonus';
import { getNumScalingSteps } from './getScalingSteps';
import { matchesCondition } from './matchesCondition';

export function abilityBonusMultiplier(actor, target, bonusConfig?: AbilityBonus): number {
    if (!bonusConfig) {
        return 1;
    }

    const { conditionType, conditions, multiplier = 0, maxSteps = Infinity } = bonusConfig;

    if (conditionType === ConditionType.FLAT) {
        if (conditionsPass(actor, target, conditions)) {
            return multiplier + 1;
        }
    } else if (conditionType === ConditionType.INCREMENTING) {
        const steps = getNumScalingSteps(actor, target, conditions);
        return Math.min(steps, maxSteps) * multiplier + 1;

    } else if (conditionType === ConditionType.DECREMENTING) {
        const steps = getNumScalingSteps(actor, target, conditions);
        // TODO
    }

    return 1;
}

function conditionsPass(actor, target, conditions): boolean {
    return conditions.some(condition => {
        const character = condition.on === 'target' ? target : actor;
        return matchesCondition(character, condition);
    });
}