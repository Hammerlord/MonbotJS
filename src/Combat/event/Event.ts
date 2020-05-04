import { DamageCalculation } from "../damage/calculator";
import { HealingCalculation } from "../healing/calculator";
import { EffectTarget } from "../models";

export enum EffectEventTypes {
    ON_RECEIVE_DAMAGE = 'onReceiveDamage',
    ON_RECEIVE_ATTACK = 'onReceiveAttack',
    ON_RECEIVE_HEALING = 'onReceiveHealing',
    ON_ABILITY_USE = 'onAbilityUse',
    ON_SYNCHRO = 'onSynchro',
    ON_SWITCH_IN = 'onSwitchIn',
    ON_ENEMY_SWITCH_IN = 'onEnemySwitchIn'
}

export enum EventType {
    /** For calculating ability costs */
    ABILITY_USE = 'abilityUse',
    ABILITY_ACTION = 'abilityAction',
    ABILITY_RECOIL = 'abilityRecoil',
    ITEM = 'item',
    SWITCH = 'switch',
    SYNCHRO = 'synchro',
    EFFECT_TRIGGER = 'effect'
}

/**
 * An event records the results of a successful command.
 */
export interface CombatEvent {
    type: EventType; // Enum that determines how this event will be parsed
    source: string; // ID of the ability/effect
    events: TeamEvent[];
    battlefieldEffects?: {
        applied?: string[];
        failed?: string[];
        dispelled?: string[];
        cancelled?: string[];
    };
}

/**
 * A sub-event of a CombatEvent. For example, multiple teams could have been damaged in one CombatEvent.
 * A TeamEvent records one instance of team damage.
 */
export interface TeamEvent {
    team: string; // ID
    forceSwitch?: boolean;

    /** CombatElemental ID */
    switchedWith?: string;
    damage?: DamageCalculation;
    healing?: HealingCalculation;
    manaChange?: number;
    defendChargesChange?: number;
    effects?: {
        target: EffectTarget;

        /** The ID of the elemental who applied this effect */
        applier: string;
        applied?: string[];
        failed?: string[];
        dispelled?: string[];
        cancelled?: string[];
    };
}