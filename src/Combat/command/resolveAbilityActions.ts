import { TargetType } from '../../Ability/Ability';
import { AbilityAction } from './../../Ability/Ability';
import { DamageSource, calculateDamage } from './../damage/calculator';
import { CombatEvent, CombatTeam, EffectTarget, EventType, PopulatedCommand, TeamEvent } from './../models';

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
            command.team,
            targetTeam,
            action as DamageSource
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

export function getAffectedTeams(targetType: TargetType, command: PopulatedCommand, sides): CombatTeam[] {
    const { A, B } = sides;
    if (targetType === TargetType.ALL_ACTIVE) {
        return A.concat(B);
    }

    if (targetType === TargetType.SELF_ACTIVE) {
        return [command.team];
    }

    const allySide = A.some(team => team.id === command.team.id) ? A : B;
    if ([TargetType.ALLY_ACTIVE, TargetType.ALLY_TEAM].includes(targetType)) {
        return [allySide[command.slot]];
    }

    const enemySide = A.every(team => team.id !== command.team.id) ? A : B;
    if ([TargetType.ENEMY_ACTIVE, TargetType.ENEMY_TEAM].includes(targetType)) {
        return [enemySide[command.slot]];
    }

    return [];
}
