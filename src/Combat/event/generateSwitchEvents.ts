import { PopulatedCommand } from "../models";
import { CombatEvent, EventType } from "./Event";
import { applyTeamEvent } from "./applyEvent";
import { getActiveEffects } from "../CombatTeam";

export function generateSwitchEvents(getTeamById, command: PopulatedCommand): CombatEvent[] {
    const { team, switchedWith } = command;

    const childEvent = {
        team: team.id,
        switchedWith
    };

    const switchEvent = {
        type: EventType.SWITCH,
        source: null,
        events: [childEvent]
    };
    applyTeamEvent(team, childEvent);

    const events: CombatEvent[] = [switchEvent];

    for (const effect of getActiveEffects(team)) {
        const { onSwitchIn } = effect;
        if (!onSwitchIn) {
            continue;
        }

        // TODO effect trigger
    }

    return events;
}
