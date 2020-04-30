import { clamp } from 'ramda';
import { AppliedEffect } from '../Ability/Effect/AppliedEffect';
import { MAX_STAGES, STAGE_BONUS } from "../constants";

/**
 * These are the stats to which stages are applicable.
 * A stage is a % increase of that stat per buff applied (think of Pokemon stages).
 */
export type BaseStat = 'physicalAtt' | 'magicAtt' | 'physicalDef' | 'magicDef' | 'speed';

/**
 * This is a subset of a CombatElemental containing the relevant fields.
 */
interface Character {
    physicalAtt: number;
    magicAtt: number;
    physicalDef: number;
    magicDef: number;
    speed: number;
    // These should also include team status effects.
    statusEffects: AppliedEffect[];
}

export function calculateTotalStat(character: Character, stat: BaseStat): number {
    if (!character) {
        return 0;
    }

    const baseStat = character[stat] || 1;
    const stages = calculateStatStages(character.statusEffects, stat);
    return Math.ceil(applyStages(baseStat, stages));
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