import { TargetType } from '../../Ability/Ability';
import { Battlefield, CombatTeam, PopulatedCommand } from './../models';

/**
 * A team can only be affected (eg. by an ability) if it has an active elemental that is alive.
 * This is even if a status effect is being applied onto the team.
 */
export function getAffectedTeams(
    targetType: TargetType,
    command: PopulatedCommand,
    sides: Battlefield
): CombatTeam[] {

    const { A, B } = sides;
    let teams = [];

    if (targetType === TargetType.ALL_ACTIVE) {
        teams = A.concat(B);
    }

    if (targetType === TargetType.SELF_ACTIVE) {
        teams = [command.team];
    }

    const { slot, side } = command;
    if (targetType === TargetType.SIDE_ACTIVE && side) {
        teams = sides[side].slice();
    } else {
        const [allySide, enemySide] = A.some(team => team.id === command.team.id) ? [A, B] : [B, A];

        if ([TargetType.ALLY_ACTIVE, TargetType.ALLY_TEAM].includes(targetType)) {
            teams = [allySide[slot]];
        }

        if ([TargetType.ENEMY_ACTIVE, TargetType.ENEMY_TEAM].includes(targetType)) {
            teams = [enemySide[slot]];
        }
    }

    return teams.filter(team => team && team.active && team.active.HP > 0);
}
