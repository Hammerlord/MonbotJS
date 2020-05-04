import { clone } from 'ramda';
import { CombatEvent, EventType, TeamEvent } from '../event/Event';
import { generateAbilityEvents } from '../event/generateAbilityEvents';
import { AppliedEffect } from './../../Ability/Effect/AppliedEffect';
import { CommandType, PopulatedCommand, Battlefield, CombatTeam } from './../models';
import { isActionableCommand } from './isActionableCommand';
import { prioritizeCommands } from './prioritizeCommands';
import { teamGetter, elementalGetter } from '../helpers';
import { generateSwitchEvents } from '../event/generateSwitchEvents';
import { CombatElemental } from '../../Elemental/CombatElemental';


export function resolveCommands(commands: PopulatedCommand[], sides: Battlefield): CombatEvent[] {
    sides = clone(sides);
    const getTeamById = teamGetter(sides.A.concat(sides.B));
    const getElemental = elementalGetter(sides);

    return prioritizeCommands(commands).reduce((acc, command) => {
        if (isActionableCommand(sides, command)) {
            acc.push(...generateEvents(getTeamById, getElemental, sides, command));
        }
        return acc;
    }, []);
}

// TODO items...
const getCommandHydrater = getAbilityById => getTeamById => command => {
    return {
        ...command,
        ability: getAbilityById(command.ability),
        team: getTeamById(command.team)
    };
}

function generateEvents(
    getTeamById: (id: string) => CombatTeam,
    getElementalById: (id: string) => CombatElemental,
    sides: Battlefield,
    command: PopulatedCommand
): CombatEvent[] {

    const { type } = command;
    switch (type) {
        case CommandType.ABILITY:
            return generateAbilityEvents(getTeamById, getElementalById, command, sides);
        case CommandType.SYNCHRO:
            // TODO
            break;
        case CommandType.ITEM:
            // TODO
            break;
        case CommandType.SWITCH:
            return generateSwitchEvents(getTeamById, getElementalById,
                { team: command.team, switchedWith: command.switchedWith });
    }

    return [];
}
