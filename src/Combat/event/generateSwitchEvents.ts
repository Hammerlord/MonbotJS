import { CombatElemental } from "../../Elemental/CombatElemental";
import { CombatTeam } from "../models";
import { CombatEvent, EffectEventTypes, EventType } from "./Event";
import { generateEffectEvents } from "./generateEffectEvent";

export function generateSwitchEvents(
    getTeamById: (id: string) => CombatTeam,
    getElementalById: (id: string) => CombatElemental,
    { team, switchedWith }
): CombatEvent[] {

    const childEvent = {
        team: team.id,
        switchedWith
    };

    const switchEvent = {
        type: EventType.SWITCH,
        source: null,
        events: [childEvent]
    };

    return [
        switchEvent,
        ...generateEffectEvents(EffectEventTypes.ON_SWITCH_IN, team, getElementalById)
    ];
}
