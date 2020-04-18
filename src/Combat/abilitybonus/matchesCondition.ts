import { isBuff } from "../../Ability/Effect/isBuff";
import { partition } from "../../utils";

export function matchesCondition(character, conditionConfig): boolean {
    const {
        comparator,
        numEffects,
        numDebuffs,
        numBuffs,
        hasEffectType,
        healthPercentage,
        mana,
        manaPercentage,
        recentlySwitchedIn, // TODO can't figure this out without more context...
        lastAbilityUsed
    } = conditionConfig;

    const passes = passesWithComparator(comparator);

    if (!passes(character.statusEffects.length, numEffects)) {
        return false;
    }

    const [buffs, debuffs] = partition(isBuff, character.statusEffects);
    if (!passes(buffs.length, numBuffs) || !passes(debuffs.length, numDebuffs)) {
        return false;
    }

    if (character.statusEffects.every(({ type }) => type !== hasEffectType)) {
        return false;
    }

    if (!passes(character.HP / character.maxHP, healthPercentage)) {
        return false;
    }

    if (!passes(character.mana, mana)) {
        return false;
    }

    if (!passes(character.mana / character.maxMana, manaPercentage)) {
        return false;
    }

    return true;
}

const passesWithComparator = (comparator: string) => (base: number, toMeet: number | undefined): boolean => {
    if (toMeet === undefined) {
        return true;
    }

    switch(comparator) {
        case 'eq':
            return base === toMeet;
        case 'lt':
            return base < toMeet;
        case 'gt':
            return base > toMeet;
    }

    console.error(`Comparator (one of eq, lt, or gt) was not defined: got ${comparator} instead.`);
    return true;
}