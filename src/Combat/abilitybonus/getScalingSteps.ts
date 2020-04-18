import { partition } from "../../utils";
import { isBuff } from "../../Ability/Effect/isBuff";

/**
 * Calculate the number of steps to increment a multiplier for an ability bonus.
 * For example, an attack may gain 20% more damage for each debuff on the target, where
 * the function returns the number of debuffs on the target.
 */
export function getNumScalingSteps(actor, target, stepConfigs): number {
    return stepConfigs.reduce((acc, config) => {
        const character = config.on === 'target' ? target : actor;
        const {
            numEffects,
            numDebuffs,
            numBuffs,
            hasEffectType,
            healthPercentage,
            healthLostPercentage,
            mana,
            manaPercentage,
            manaLostPercentage,
            recentlySwitchedIn, // TODO can't figure this out without more context...
            lastAbilityUsed
        } = config;

        const calcSteps = (quotient: number) => Math.floor(quotient) + acc;

        if (numEffects) {
            return calcSteps(character.statusEffects.length / numEffects);
        }

        const [buffs, debuffs] = partition(isBuff, character.statusEffects);
        if (numBuffs) {
            return calcSteps(buffs.length / numBuffs);
        }

        if (numDebuffs) {
            return calcSteps(debuffs.length / numDebuffs);
        }

        if (hasEffectType) {
            return character.statusEffects.filter(effect => effect.type === hasEffectType).length + acc;
        }

        if (healthPercentage) {
            return calcSteps((character.HP / character.maxHP) / healthPercentage);
        }

        if (healthLostPercentage) {
            return calcSteps((1 - character.HP / character.maxHP) / healthLostPercentage);
        }

        if (mana) {
            return calcSteps(character.mana / mana);
        }

        if (manaPercentage) {
            return calcSteps((character.mana / character.maxMana) / manaPercentage);
        }

        if (manaLostPercentage) {
            return calcSteps((1 - character.mana / character.maxMana) / manaPercentage);
        }

        return 0;
    });
}