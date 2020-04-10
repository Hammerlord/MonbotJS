import { clamp } from 'ramda';
import { MAX_STAGES, STAGE_BONUS } from "../constants";
import { CombatTeam } from './models';
import { AppliedEffect } from '../Ability/Effect/AppliedEffect';
import { getActiveEffects } from './CombatTeam';

export type BaseStat = 'physicalAtt' | 'magicAtt' | 'physicalDef' | 'magicDef' | 'speed';

export function calculateTotalStat(team: CombatTeam, stat: BaseStat): number {
    if (!team.active) {
        return 0;
    }

    const baseStat = team.active[stat];
    const stages = calculateStatStages(getActiveEffects(team), stat);
    return applyStages(baseStat, stages);
}

export function calculateStatStages(statusEffects: AppliedEffect[], stat: string): number {
    const stages = statusEffects.reduce((acc, effect) => {
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