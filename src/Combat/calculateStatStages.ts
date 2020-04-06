import { clamp } from 'ramda';
import { MAX_STAGES, STAGE_BONUS } from "../constants";
import { CombatTeam } from './models';

export function sumStat(
    team: CombatTeam,
    stat: 'physicalAtt' | 'magicAtt' | 'physicalDef' | 'magicDef' | 'speed'
    ): number {

    if (!team.active) {
        return 0;
    }
    const stages = calculateStatStages(team, stat);
    const baseStat = team.active[stat];
    return applyStages(baseStat, stages);
}

export function calculateStatStages(team: CombatTeam, stat: string): number {
    const teamActiveEffects = team.active ? team.active.statusEffects : [];
    const stages = team.statusEffects.concat(teamActiveEffects)
        .reduce((acc, effect) => {
            if (effect[stat]) {
                return effect[stat] * effect.stacks + acc;
            }
            return acc;
        }, 0);

    return clamp(-MAX_STAGES, MAX_STAGES, stages);
}

function applyStages(base: number, stages: number): number {
    if (stages >= 0) {
        return base + (base * stages * STAGE_BONUS);
    }

    return base * Math.pow(1 - STAGE_BONUS, Math.abs(stages));
}