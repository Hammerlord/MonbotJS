import { AbilityAction, TargetType } from '../../Ability/Ability';
import { getAffectedTeams } from '../command/getAffectedTeams';
import { calculateDamage, DamageSource } from '../damage/calculator';
import { PopulatedCommand, CombatTeam, EffectTarget } from '../models';
import { CombatEvent, EventType, TeamEvent } from './Event';

export function resolveAbilityAction(
    action: AbilityAction,
    command: PopulatedCommand,
    sides): CombatEvent {

    const affectedTeams = getAffectedTeams(action.targetType, command, sides);
    return {
        type: EventType.ABILITY_ACTION,
        source: command.ability.id,
        events: mapActionToEvents(action, command, affectedTeams),
        battlefieldEffects: {}
    };
}

function mapActionToEvents(
    action: AbilityAction,
    command: PopulatedCommand,
    affectedTeams: CombatTeam[]): TeamEvent[] {

    return affectedTeams.map(targetTeam => {

        const damage = calculateDamage(
            command.team.active,
            targetTeam.active,
            {
                ...action,
                isAbility: true
            } as DamageSource
        );

        const event = {
            team: targetTeam.id,
            damage,
            manaChange: 0, // TODO and healing
            forceSwitch: action.forceSwitch,
            effects: {
                target: getEffectTargetType(action.targetType),
                applied: action.effects.slice()
            }
        };

        return event as TeamEvent;
    }).filter(e => e); // Remove undefined items
}

export function getEffectTargetType(targetType: TargetType): EffectTarget {
    if ([
        TargetType.ALL_ACTIVE,
        TargetType.SELF_ACTIVE,
        TargetType.ALLY_ACTIVE,
        TargetType.ENEMY_ACTIVE
    ].includes(targetType)) {
        return EffectTarget.ACTIVE_ELEMENTAL;
    }

    return EffectTarget.TEAM;
}