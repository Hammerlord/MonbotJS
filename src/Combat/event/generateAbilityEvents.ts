import { Ability } from "../../Ability/Ability";
import { getActiveEffects } from '../CombatTeam';
import { calculateDamage } from "../damage/calculator";
import { calculateHealing } from '../healing/calculator';
import { elementalGetter, teamGetter } from "../helpers";
import { Battlefield, CombatTeam, PopulatedCommand } from "../models";
import { ElementCategory, Elements } from './../../Element/Elements';
import { applyTeamEvent } from "./applyEvent";
import { CombatEvent, EffectEventTypes, EventType, TeamEvent } from "./Event";
import { generateEffectEvents } from './generateEffectEvent';
import { handleRecoil } from './handleRecoil';
import { resolveAbilityAction } from "./resolveAbilityActions";
import { CombatElemental } from "../../Elemental/CombatElemental";


export function generateAbilityEvents(
    getTeam: (id: string) => CombatTeam,
    getElemental: (id: string) => CombatElemental,
    command: PopulatedCommand,
    sides: Battlefield
): CombatEvent[] {

    const { ability, team } = command;
    const abilityUseEvent = makeAbilityUseEvent(ability, team);
    const events = [abilityUseEvent];

    abilityUseEvent.events.forEach(event => {
        applyTeamEvent(team, event);
        events.push(...generateEffectEvents(EffectEventTypes.ON_ABILITY_USE, team, getElemental));
    });

    for (const action of ability.actions) {
        if (!team.active || team.active.HP <= 0) { // TODO or is stunned
            break;
        }

        const event = resolveAbilityAction(action, command, sides);
        event.events.forEach(e => applyTeamEvent(getTeam(e.team), e));
        events.push(event, ...onReceiveAbilityEffectEvent(getTeam, getElemental, event));
    }

    const recoilEvents = handleRecoil(ability, team, getElemental);
    if (recoilEvents) {
        events.push(...recoilEvents);
    }

    return events;
}


function onReceiveAbilityEffectEvent(getTeam, getElemental, event: CombatEvent): CombatEvent[] {
    const { ON_RECEIVE_ATTACK, ON_RECEIVE_DAMAGE, ON_RECEIVE_HEALING } = EffectEventTypes;
    const effectEvents = {
        [ON_RECEIVE_ATTACK]: [],
        [ON_RECEIVE_DAMAGE]: [],
        [ON_RECEIVE_HEALING]: []
    };

    event.events.forEach(e => {
        const team = getTeam(e.team);
        if (!team.active || team.active.HP <= 0) {
            return;
        }

        const { damage, healing } = e;
        const triggerEffectEvents = (type: EffectEventTypes) => generateEffectEvents(type, team, getElemental);

        if (damage) {
            if (damage.isAttack) {
                effectEvents[ON_RECEIVE_ATTACK].push(...triggerEffectEvents(ON_RECEIVE_ATTACK));
            }

            if (damage.finalDamage) {
                effectEvents[ON_RECEIVE_DAMAGE].push(...triggerEffectEvents(ON_RECEIVE_DAMAGE));
            }
        }

        if (healing && healing.finalHealing) {
            effectEvents[ON_RECEIVE_HEALING].push(...triggerEffectEvents(ON_RECEIVE_HEALING));
        }
    });

    return Object.values(effectEvents)
        .filter(events => events.length > 0)
        .map(events => ({
            type: EventType.EFFECT_TRIGGER,
            source: event.source,
            events
        }));
}

function makeAbilityUseEvent(ability: Ability, team: CombatTeam): CombatEvent {
    const { id, requirements } = ability;
    const { hpCost = 0, defendCost = 0, manaCost = 0 } = requirements || {};
    const hpChange = -hpCost;

    const active = {
        ...team.active,
        statusEffects: getActiveEffects(team)
    };

    const event = {
        team: team.id,
        defendChargesChange: -defendCost,
        manaChange: -manaCost
    } as TeamEvent;

    if (hpChange > 0) {
        event.damage = calculateDamage(active, active, {
            elements: [Elements.NONE],
            elementCategory: ElementCategory.NONE,
            damageMultiplier: 1,
            calculation: {
                calculationTarget: 'actor',
                stat: 'maxHP',
                amount: hpChange
            },
            isAbility: false
        });
    } else if (hpChange < 0) {
        event.healing = calculateHealing(active, active, {
            calculationTarget: 'actor',
            stat: 'maxHP',
            amount: hpChange
        });
    }

    return {
        type: EventType.ABILITY_USE,
        source: id,
        events: [event]
    };
}
