import { Battlefield } from './../models';
import { TargetType } from '../../Ability/Ability';
import { canUseAbility } from '../abilityparser';
import { CommandType, PopulatedCommand } from '../models';

/**
 * True if the active elemental is able to act on the command.
 * If false, the command fails and does nothing.
 * This is different from incorrect user input (eg. user has selected an ability that the
 * elemental doesn't have, tried to use an item when the game mode doesn't permit items).
 * In which case the command would be rejected from the queue.
 */
export function isActionableCommand(sides, command: PopulatedCommand): boolean {
    const { team, type, ability, originalActive } = command;

    if (type === CommandType.ABILITY) {
        return isActionableAbility(command, sides);
    }

    return true;
}

function isActionableAbility(command: PopulatedCommand, sides: Battlefield): boolean {
    const { team, ability, originalActive } = command;
    const { active, defendCharges } = team;

    if (!active || originalActive !== active.id) {
        return false;
    }

    if (active.HP === 0) {
        return false;
    }

    if (ability && !canUseAbility(active, defendCharges, ability.requirements)) {
        return false;
    }

    /**
     * One action may deal single-target damage, while the next heals a target.
     * If one action fails, the rest should still be able to trigger.
     */
    const targetIsInvalid = ({ targetType }) => {
        if (![TargetType.ALLY_ACTIVE, TargetType.ENEMY_ACTIVE].includes(targetType)) {
            return false;
        }

        const side = sides[command.side];
        const targetTeam = side[command.slot];
        return !targetTeam || !targetTeam.active || targetTeam.active.HP === 0;
    };

    if (ability.actions.every(targetIsInvalid)) {
        return false;
    }

    return true;
}