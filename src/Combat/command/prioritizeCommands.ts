import { coinFlip } from '../../utils';
import { sumStat } from '../calculateStatStages';
import { CombatTeam, PopulatedCommand } from './../models';

/**
 * Commands are initially in the order they're received.
 * Reorders them based on action priority and active elemental speed.
 */
export function prioritizeCommands(commands: PopulatedCommand[]): PopulatedCommand[] {
    return commands.sort((a, b) => {
        if (a.type !== b.type) {
            return a.type - b.type;
        }

        if (a.ability.priority !== b.ability.priority) {
            return a.ability.priority - b.ability.priority;
        }

        if (getSpeed(a.team) !== getSpeed(b.team)) {
            return getSpeed(b.team) - getSpeed(a.team);
        }

        return coinFlip() ? 1 : -1;
    });
}

function getSpeed(team: CombatTeam): number {
    return team.active ? sumStat(team, 'speed') : Infinity;
}