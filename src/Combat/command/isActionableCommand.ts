import { TargetType } from '../../Ability/Ability';
import { canUseAbility } from '../abilityparser';
import { getActiveEffects } from '../CombatTeam';
import { CommandType, PopulatedCommand } from '../models';
import { getAffectedTeams } from './getAffectedTeams';

/**
 * True if the active elemental is able to act on the command.
 * If false, the command fails and does nothing.
 * This is different from incorrect user input (eg. user has selected an ability that the
 * elemental doesn't have, tried to use an item when the game mode doesn't permit items).
 * In which case the command would be rejected from the queue.
 */
export function isActionableCommand(sides, command: PopulatedCommand): boolean {
    const { type } = command;

    if (type === CommandType.ABILITY) {
        const hasValidTargets = targetType => getAffectedTeams(targetType, command, sides).length === 0;
        return isActionableAbilityCommand(hasValidTargets, command);
    }

    return true;
}

export function isActionableAbilityCommand(
    hasValidTargets: (targetType: TargetType) => boolean,
    command: PopulatedCommand): boolean {

    const { team, ability, originalActive } = command;
    const { active, defendCharges } = team;

    if (!active || originalActive !== active.id) {
        return false;
    }

    if (active.HP === 0) {
        return false;
    }

    if (ability && !canUseAbility(
        { ...active, statusEffects: getActiveEffects(team) },
        defendCharges,
        ability.requirements)) {
        return false;
    }

    const hasNoValidTargets = ({ targetType }) => !hasValidTargets(targetType);
    if (ability.actions.every(hasNoValidTargets)) {
        return false;
    }

    return true;
}