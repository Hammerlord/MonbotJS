import { AbilityBonus } from '../Combat/abilitybonus/Bonus';
import { Elements, ElementCategory } from '../Element/Elements';

/**
 * Which teams/elementals an ability will affect when used.
 * "Active" targeting affects the team's active elemental.
 * "Team" targeting is typically for team-wide buff/debuff applications, ie. status effects
 * that aren't dispelled on switch-out. Otherwise behaves the same as "active" targeting.
 */
export enum TargetType {
    NONE = 'none',

    /** User picks a side to affect; TODO help/harm */
    SIDE_ACTIVE = 'sideActive',
    ALL_ACTIVE = 'all',
    SELF_ACTIVE = 'selfActive',
    SELF_TEAM = 'selfTeam',

    /** Affects self non-active elementals only */
    SELF_BENCH = 'selfBench',

    /** Affects ally (including caster) elementals only */
    ALLY_ACTIVE = 'allyActive',
    ALLY_TEAM = 'allyTeam',

    /** Affects enemy active elementals only */
    ENEMY_ACTIVE = 'enemyActive',
    ENEMY_TEAM = 'enemyTeam'
}

/**
 * When resolving the order of turns taken, some kinds of actions are always faster than others.
 * If priority is the same, match speed instead.
 * Integer matters: the ranking is used to calculate the turn priority from faster to slower.
 * @see prioritizeCommands

 */
export enum ActionPriority {
    DEFEND = 1,
    HIGH = 2,
    NORMAL = 3,
    LOW = 4
}

export interface Learnable {
    /** ID of the ability */
    id: string;
    /** Level requirement */
    levelReq: number;
}

export interface Ability {
    id: string;
    name: string;
    priority: ActionPriority;
    description: string;
    icon: string;
    requirements?: AbilityRequirements;

    /**
     * Components to the ability, if any, resolved in order.
     */
    actions: AbilityAction[];
}

export interface AbilityRequirements {
    /**
     * If a negative number is supplied, then the character gains that amount of resource.
     */
    manaCost?: number;
    hpCost?: number;
    defendCost?: number;
}

/**
 * An ability can have multiple components ("actions").
 * For example, an ability might damage the target and heal the actor, or
 * allow the character to attack different targets in one turn.
 */
export interface AbilityAction {
    elementCategory: ElementCategory;
    elements: Elements[];

    /**
     * Status effects applied.
     */
    effects?: string[];
    damageMultiplier?: number;
    damageBonus?: AbilityBonus;
    healing?: AbilityHealing;

    /**
     * Adjacent targets affected by this ability.
     * 0: single target
     * 1: affects 1 target on either side of the primary target
     * -1: affects all targets on that side of the board
     */
    splashRange: number;
    targetType: TargetType;

    /**
     * Causes an active elemental switch out
     */
    forceSwitch: boolean;
}

/**
 * How to calculate healing on an AbilityAction. Assumptions include:
 * - Most ability healing will be based on max HP of the caster.
 * - It doesn't matter what element the healing spell was (famous last words...).
 */
export interface AbilityHealing {
    calculationTarget: 'target' | 'actor'; // This is who to calculate the healing amount from...
    amount: number; // Flat healing
    multiplier: number;
    /** Required if type is 'percentage' */
    stat?: 'maxHP' | 'HP' | 'maxMana' | 'mana';
    bonus?: AbilityBonus;
}