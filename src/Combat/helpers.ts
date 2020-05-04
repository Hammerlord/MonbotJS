import { CombatTeam, Battlefield } from "./models";
import { CombatElemental } from "../Elemental/CombatElemental";

export function teamGetter(teams: CombatTeam[]): (id: string) => CombatTeam | undefined {
    const teamIdMap = teams.reduce((acc, team) => ({ ...acc, [team.id]: team }), {});
    return id => teamIdMap[id];
}

/**
 * Curried helper to get a CombatElemental given an id.
 */
export function elementalGetter(sides: Battlefield): (id: string) => CombatElemental {
    const elementalMap = sides.A.concat(sides.B).reduce((acc, team) => {
        team.elementals.forEach(elemental => acc[elemental.id] = elemental);
        return acc;
    }, {});
    return id => elementalMap[id];
}