/**
 * @file Level up functions
 */
import { MAX_LEVEL, INITIAL_EXP_TO_LEVEL } from './../constants';
import { Species } from './Species';
import { getSpeciesById } from './speciesgateway';

const expToLevel = [0, INITIAL_EXP_TO_LEVEL];

for (let i = expToLevel.length; i <= MAX_LEVEL; ++i) {
    const last = expToLevel[expToLevel.length - 1];
    expToLevel[i] = last * 1.2 + i;
}

export function getExpToLevel(level: number): number | undefined {
    return expToLevel[level];
}

export function checkLevelUp(elemental): boolean {
    if (elemental.exp > getExpToLevel(elemental.level)) {
        levelUp(elemental);
        return true;
    }
    return false;
}

export function levelTo(elemental, desiredLevel: number) {
    while (elemental.level < desiredLevel) {
        levelUp(elemental);
    }
}

function levelUp(elemental) {
    elemental.level += 1;
    elemental.exp - getExpToLevel(elemental.level);
    const statBonus = Math.floor(elemental.level / 10);
    const species = getSpeciesById(elemental.species) as Species;
    for (const [statName, value] of Object.entries(species.statGrowth)) {
        elemental[statName] += value + statBonus;
    }
}