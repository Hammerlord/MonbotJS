/**
 * @file Combat-related data model blueprints
 */

import { Ability } from './../Ability/Ability';
import { AppliedEffect } from '../Ability/Effect/AppliedEffect';
import { CombatElemental } from './../Elemental/CombatElemental';

export type BattlefieldSide = 'A' | 'B';

/**
 * Integer matters: the ranking is used to calculate the turn priority of the
 * commands from faster to slower.
 * @see prioritizeCommands
 */
export enum CommandType {
    FLEE = 1,
    SWITCH = 2,
    ITEM = 3,
    SYNCHRO = 4,
    ABILITY = 5
}

export enum EventType {
    /** For calculating ability costs */
    ABILITY_USE = 'abilityUse',
    ABILITY_ACTION = 'abilityAction',
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

export enum EffectTarget {
    ACTIVE_ELEMENTAL = 'activeElemental',
    TEAM = 'team'
}

export interface DamageCalculation {
    effectivenessBonus?: number;
    sameTypeBonus?: number;
    abilityBonus?: number;
    finalDamage: number;
    // This is if the damage was reduced by Defend specifically.
    isDefended?: boolean;
    // This is if the damage was reduced by a global damage reduction, such as Stonehide or Frost Barrier.
    isBlocked?: boolean;
}

export interface HealingCalculation {
    abilityBonus?: number;
    finalHealing: number;
}

/**
 * A request made by a combat participant.
 * If valid, becomes an event.
 */
export interface Command {
    team: string; // CombatTeam ID making this request
    originalActive: string | null; // Active elemental ID eg. to check the original ability user can still make the move
    type: CommandType;
    ability?: string;
    side?: BattlefieldSide; // The battlefield side targeted in the request ('A' | 'B')
    slot?: number; // Battlefield side slot targeted in the request [0, 1, 2]
}

/**
 * A Command with some of its fields replaced by an object reference (not ID).
 * This is for convenience, for example, when we need the Team/Ability properties for validation.
 */
export interface PopulatedCommand {
    team: CombatTeam;
    originalActive: string | null; // Active elemental ID eg. to check the original ability user can still make the move
    type: CommandType;
    ability?: Ability;
    side?: BattlefieldSide; // The battlefield side targeted in the request ('A' | 'B')
    slot?: number; // Battlefield side slot targeted in the request [0, 1, 2]
    switchedWith?: string;
}

export interface Combat {
    id: string;
    sides: Battlefield;
    events: CombatEvent[];
    currentRoundCommands: Command[];
    round: number;
    statusEffects: AppliedEffect[];
    options: object;
}

export interface Battlefield {
    A: (CombatTeam | null)[];
    B: (CombatTeam | null)[];
}

export interface CombatTeam {
    id: string;
    owner: string | null;
    active: CombatElemental | null;
    elementals: CombatElemental[];
    statusEffects: AppliedEffect[];
    hasForfeit: boolean;
    defendCharges: number;
}