import { CombatTeam } from "./models";

export function teamGetter(teams: CombatTeam[]): (id: string) => CombatTeam | undefined {
    const teamIdMap = teams.reduce((acc, team) => ({ ...acc, [team.id]: team }), {});
    return id => teamIdMap[id];
}