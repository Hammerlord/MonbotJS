import { clone } from 'ramda';
import { Battlefield, CombatEvent, CombatTeam, CommandType, EventType, PopulatedCommand, TeamEvent } from '../models';
import { Ability } from './../../Ability/Ability';
import { AppliedEffect } from './../../Ability/Effect/AppliedEffect';
import { EffectEvent } from './../../Ability/Effect/Effect';
import { applyEvent } from './applyEvent';
import { isActionableCommand } from './isActionableCommand';
import { prioritizeCommands } from './prioritizeCommands';
import { resolveAbilityAction } from './resolveAbilityActions';


export function resolveCommands(commands: PopulatedCommand[], sides) { // TODO battlefield status effects
    // Deep clone against mutations. TODO ???
    const battlefield = clone(sides);
    const { A, B } = battlefield;

    const getTeamById = teamGetter(A.concat(B));

    return prioritizeCommands(commands).reduce((acc, command) => {
        if (isActionableCommand(battlefield, command)) {
            acc.push(...generateEvents(battlefield, command));
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

function generateEvents(sides, command): CombatEvent[] {
    const { type, ability, team } = command;
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
            return generateSwitchEvents(command);
    }

    return [];
}

function generateAbilityEvents(command: PopulatedCommand, sides: Battlefield): CombatEvent[] {
    const { ability, team } = command;
    const abilityUseEvent = makeAbilityUseEvent(ability, team);
    applyEvent(team, abilityUseEvent); // TODO wrong param...
    const events = [abilityUseEvent];

    for (const action of ability.actions) {
        if (!team.active || team.active.HP === 0) { // TODO or is stunned
            break;
        }

        const event = resolveAbilityAction(action, command, sides);
        applyEvent(team, event);
        events.push(event);
    }

    return events;
}


function makeAbilityUseEvent(ability: Ability, team: CombatTeam): CombatEvent {
    const { id, requirements } = ability;
    const event = {
        team: team.id,
        damage: {
            finalDamage: 0, // This is the upfront ability cost.
        },
        defendChargesChange: -(requirements?.defendCost || 0),
        manaChange: -(requirements?.manaCost || 0)
    };

    return {
        type: EventType.ABILITY_USE,
        source: id,
        events: [event]
    };
}

function generateSwitchEvents(command) {
    const events = [];
    const switchEvent = makeSwitchEvent(command);
    applyEvent(switchEvent);
    events.push(switchEvent);
    // TODO status effects
    return events;
}

function makeSwitchEvent(command: PopulatedCommand): CombatEvent {
    const { team, switchedWith } = command;

    return {
        type: EventType.SWITCH,
        source: null,
        events: [{
            team: team.id,
            switchedWith
        }]
    };
}

function triggerEffects(sides: Battlefield, event: CombatEvent): CombatEvent[] {
    const { A, B } = sides;
    const events = [];
    A.concat(B).forEach(team => {
        team.statusEffects.forEach((effect: AppliedEffect) => {
            const configs = getTriggeredEffectConfigs(effect, event)
            const event = {
                type: EventType.EFFECT_TRIGGER,
                source: effect.id,

            };

            events.push(event);
        });

        if (team.active) {
            team.active.statusEffects.forEach((effect: AppliedEffect) => {
                const config = trigger(effect);
            });
        }
    });

    return events;
}

/**
 * Based on what happened in the TeamEvent, get the EffectEvent(s) that triggered.
 * TODO awkwardly we need the parent event to get more context about what happened.
 */
function getTriggeredEffectConfigs(appliedEffect: AppliedEffect, event: TeamEvent, parent: CombatEvent): EffectEvent[] {
    const {
        onAbilityUse,
        onReceiveAttack,
        onReceiveDamage,
        onReceiveHealing,
        onSynchro,
        onSwitchIn
    } = appliedEffect.effect;

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

    switch (parent.type) {
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

    return configs.filter(item => item);
}

function parseEffectConfig(config: EffectEvent, target, applier) {
    // Let's assume for now effects are only concerned with target/applier....
    // TODO config conditions

}


function teamGetter(teams): (id: string) => CombatTeam | undefined {
    const teamIdMap = teams.reduce((acc, team) => ({ ...acc, [team.id]: team }), {});
    return id => teamIdMap[id];
}