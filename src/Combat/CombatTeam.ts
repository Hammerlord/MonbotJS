import { Elemental } from './../Elemental/Elemental';
import { CombatTeam } from "./models";
import uuid = require("uuid");
import { makeCombatElemental } from "../Elemental/CombatElemental";
import { AppliedEffect } from "../Ability/Effect/AppliedEffect";

export function makeCombatTeam(elementals: Elemental[], owner: string = null): CombatTeam {
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

/**
 * Team-level status effects are applied on whoever is the active elemental.
 * Eg. if you apply a strength buff on the team, your active elemental - whoever you switch in - benefits from that buff.
 * This helper combines team status effects and its active elemental's status effects, which allows
 * total stat changes to be aggregated at any point in time.
 */
export function getActiveEffects({ active, statusEffects }): AppliedEffect[] {
    const teamActiveEffects = active ? active.statusEffects : [];
    return statusEffects.concat(teamActiveEffects);
}