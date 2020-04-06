import * as uuid from 'uuid';
import { Combat, CombatTeam } from './models';
import { makeCombatElemental } from '../Elemental/CombatElemental';

const DEFAULT_COMBAT_OPTIONS = {
    items: true,
    expGain: true,
    flee: true
};

export function createCombat(
    A: (CombatTeam | null)[],
    B: (CombatTeam | null)[],
    options = DEFAULT_COMBAT_OPTIONS
): Combat {

    return {
        id: uuid.v4(),
        sides: { A, B },
        options,
        events: [],
        currentRoundCommands: [],
        statusEffects: [], // These are battlefield-wide effects.
        round: 1
    };
}

export function makeCombatTeam(owner: string = null, elementals): CombatTeam {
    return {
        id: uuid.v4(),
        owner,
        active: null,
        elementals: elementals.map(makeCombatElemental),
        defendCharges: 2,
        statusEffects: [],
        hasForfeit: false,
    };
}

/** Caches the particular battle that a user is participating in. User ID: Combat */
const combatRegistry = {};

function deregisterCombatants(combatants: string[]) {
    combatants.forEach(combatant => delete combatRegistry[combatant]);
}

function registerCombatants(combat) {

}