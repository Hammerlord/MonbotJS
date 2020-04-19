/**
 * @file Combat-related data model blueprints
 */
import { AppliedEffect } from '../Ability/Effect/AppliedEffect';
import { Ability } from './../Ability/Ability';
import { CombatElemental } from './../Elemental/CombatElemental';
import { CombatEvent } from './event/Event';

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

export enum EffectTarget {
    ACTIVE_ELEMENTAL = 'activeElemental',
    TEAM = 'team'
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