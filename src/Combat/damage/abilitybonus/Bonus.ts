import { EffectType } from '../../../Ability/Effect/Effect';

export enum ConditionType {
    INCREMENTING = 'incrementing',
    DECREMENTING = 'decrementing',
    FLAT = 'flat'
}

export interface AbilityBonus {
    /** 
     * Damage multiplier; typically a value < 1 (eg. to multiply by steps when the type is `incrementing`).
     * Final value should have 1 added to it.
     */
    multiplier?: number;

    /**
     * Eg. to limit how high the multiplier can go for `incrementing` bonus type.
     */
    maxSteps?: number;

    /** 
     * Whether this is a pass/fail bonus or a scaling bonus. Examples:
     * Flat: target health is 90% or above
     * Incrementing: multiplier * numDebuffs on target
     * Decrementing: max 100% bonus, but - 20% for every buff on actor.
     */
    conditionType: ConditionType;

    /** 
     * Conditions to pass for the bonus to apply.
     * Multiple conditions are evaluated as "OR".
     */
    conditions: BonusConditions[];
}

interface BonusConditions {
    on: 'actor' | 'target';
    /** Equals | Less than | Greater than -- Only used in pass/fail check */
    comparator?: 'eq' | 'lt' | 'gt';

    /** Unique effects, not stacks */
    numDebuffs: number;
    numBuffs: number;
    hasEffectType: EffectType;
    /** Unique effects, not stacks */
    numEffects: number;
    healthPercentage: number;
    healthPercentageLost: number;
    mana: number;
    manaPercentage: number;
    manaPercentageLost: number;
    // TODO no way to know these
    justSwitchedIn: boolean;
    lastAbilityUsed: string; // UUID
    lastAbilityUsedElement;
}