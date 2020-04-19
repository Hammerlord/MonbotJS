import { clone } from 'ramda';
import { CombatEvent, EventType, TeamEvent } from '../event/Event';
import { generateAbilityEvents } from '../event/generateAbilityEvents';
import { AppliedEffect } from './../../Ability/Effect/AppliedEffect';
import { CommandType, PopulatedCommand, Battlefield } from './../models';
import { isActionableCommand } from './isActionableCommand';
import { prioritizeCommands } from './prioritizeCommands';
import { teamGetter } from '../helpers';
import { generateSwitchEvents } from '../event/generateSwitchEvents';


export function resolveCommands(commands: PopulatedCommand[], sides: Battlefield): CombatEvent[] {
    sides = clone(sides);
    const getTeamById = teamGetter(sides.A.concat(sides.B));

    return prioritizeCommands(commands).reduce((acc, command) => {
        if (isActionableCommand(sides, command)) {
            acc.push(...generateEvents(getTeamById, sides, command));
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

function generateEvents(getTeamById, sides, command): CombatEvent[] {
    const { type } = command;
    switch (type) {
        case CommandType.ABILITY:
            return generateAbilityEvents(command, sides);
        case CommandType.SYNCHRO:
            // TODO
            break;
        case CommandType.ITEM:
            // TODO
            break;
        case CommandType.SWITCH:
            return generateSwitchEvents(getTeamById, command);
    }

    return [];
}

/**
 * Based on what happened in the TeamEvent, get the EffectEvent(s) that triggered.
 */
const getTriggeredEffectConfigs = (type: EventType) => (event: TeamEvent, effect: AppliedEffect) => {

    const {
        onAbilityUse,
        onReceiveAttack,
        onReceiveDamage,
        onReceiveHealing,
        onSynchro,
        onSwitchIn
    } = effect;

    const configs = [];
    const { damage, healing } = event;

    if (damage) {
        if (damage.finalDamage) {
            configs.push(onReceiveDamage);
        }

        if (damage.isAttack) {
            configs.push(onReceiveAttack);
        }
    }

    if (healing && healing.finalHealing) {
        configs.push(onReceiveHealing);
    }

    switch (type) {
        case EventType.ABILITY_USE:
            configs.push(onAbilityUse);
            break;
        case EventType.SYNCHRO:
            configs.push(onSynchro);
            break;
        case EventType.SWITCH:
            configs.push(onSwitchIn);
            break;
    }

    return configs.filter(item => item); // Filter undefined
};

