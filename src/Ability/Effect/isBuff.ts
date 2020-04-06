import { EffectType, Effect } from './Effect';

/** 
 * The following EffectTypes are considered buffs, AKA positive status effects.
 * Anything that is not a buff must be a debuff.
 */
const BUFF_CHART = {
    [EffectType.NONE]: true,
    [EffectType.HEAL]: true,
    [EffectType.STAT_INCREASE]: true
};

export function isBuff(effect: Effect): boolean {
    return Boolean(BUFF_CHART[effect.type]);
}