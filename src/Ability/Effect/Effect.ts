/**
 * @file Model structures for status effects
 */

import { Elements, ElementCategory } from '../../Element/Elements';

export enum EffectType {
    NONE = 'None',
    BURN = 'Burn',
    HEAL = 'Heal',
    BLEED = 'Bleed',
    POISON = 'Poison',
    CURSE = 'Curse',
    STUN = 'Stun',
    BERSERK = 'Berserk',
    CHILL = 'Chill',
    STAT_DECREASE = 'Stat Decrease',
    STAT_INCREASE = 'Stat Increase'
}

/**
 * Flat status effect data. Separate to the applied effect, which has information
 * such as who applied it.
 */
export interface Effect {
    id: string;
    icon: string;
    name: string;
    description: string;
    type: EffectType;
    elementCategory: ElementCategory;
    elements: Elements[];

    /**
     * Increases or decreases the stats of affected targets:
     * physicalAtt: 1 - Increases physical attack by 1 stage
     * magicDef: -2 - Decreases magic defence by 2 stages
     */
    physicalAtt?: number;
    magicAtt?: number;
    physicalDef?: number;
    magicDef?: number;
    speed?: number;

    /** Any change on maximum HP on the target. Can be negative. */
    maxHP?: number;

    /** Any change on maximum mana on the target. Can be negative. */
    maxMana?: number;
    manaPerTurnActive?: number;
    manaPerTurnInactive?: number;
    absorb?: number;

    /** Float percentage */
    damageReduction?: number;

    /**
     * The number of rounds this lasts for.
     * 1: lasts until the end of the round this was cast for.
     * 2: lasts until the end of the next round.
     * -1: lasts indefinitely.
     */
    maxDuration: number;

    /** Whether the effect can be removed by a dispel ability. */
    canBeDispelled: boolean;

    /** Should the effect be removed if the applier was knocked out? */
    removeOnApplierKO: boolean;

    /** Should the effect be removed if the applier switches out? */
    removeOnApplierSwitch: boolean;

    /** Should the effect be removed if the target switches out? */
    removeOnTargetSwitch: boolean;

    /**
     * The maximum number of stacks this effect can have.
     * Stacks are incremented when reapplying the effect, and generally
     * behave as if there are multiple of the effect (effect * numStacks).
     * -1 if it can stack indefinitely.
     */
    maxStacks: number;

    /** When this effect is reapplied, does it refresh the duration? Typically true. */
    applyRefreshDuration: boolean;

    /** When this effect is reapplied, does it reset the current number of stacks? Typically false. */
    applyResetStacks: boolean;

    /**
     * When this effect is reapplied, it adds a stack to/refreshes the same instance regardless of applier.
     * For example, Chill stacks should share the same instance.
     */
    isSingleton: boolean;

    /** Increase/decrease a stack of this effect per turn. Eg if 1, adds a stack every turn. */
    stacksPerTurn: number;

    onAbilityUse?: EffectEvent;
    onReceiveDamage?: EffectEvent;
    onReceiveAttack?: EffectEvent;
    onReceiveHealing?: EffectEvent;
    onSynchro?: EffectEvent;
    onSwitchIn?: EffectEvent;

    onTurnStart?: EffectEvent;
    onTurnEnd?: EffectEvent;
    onRoundEnd?: EffectEvent;
    onEffectApplied?: EffectEvent;
    /** Triggers when the effect naturally expires due to turns/time */
    onEffectExpired?: EffectEvent;
    onEffectDispelled?: EffectEvent;
}

/** What should happen at various events within an effect's lifetime */
export interface EffectEvent {
    /**
     * If this effect should deal damage over time to the target(s), this value applies a percentage of
     * the applier's attack stat. Eg. a value of 1 uses 100% of the actor's attack stat.
     * 0: This effect does no damage.
     */
    damageMultiplier?: number;
    damageBonus?: number;

    /**
     * Like damageMultiplier, but with healing. If 0, this effect does no healing.
     */
    healingMultiplier?: number;
    healingBonus?: number;

    /** How much mana to add/remove at this event. Integer. */
    manaChange?: number;

    /** If there should be a message when this event triggers. */
    recap?: string;

    /**
     * Adjacent targets affected for eg. 3v3
     * 0: single target
     * 1: affects 1 target on either side of the primary target
     * -1: affects all targets on that side of the board
     */
    splashRange?: number;

    /**
     * For weird cases affecting the primary target's adjacent characters, but not primary target itself.
     */
    primaryTargetNotAffected?: boolean;

    /** If triggered, does the number of stacks of the debuff change? */
    stackChange?: number;
}