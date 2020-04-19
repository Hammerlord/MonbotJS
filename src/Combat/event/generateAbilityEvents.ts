import { resolveAbilityAction } from "./resolveAbilityActions";
import { PopulatedCommand, Battlefield, CombatTeam, } from "../models";
import { Ability } from "../../Ability/Ability";
import { applyTeamEvent } from "./applyEvent";
import { CombatEvent, EventType } from "./Event";
import { teamGetter } from "../helpers";

export function generateAbilityEvents(command: PopulatedCommand, sides: Battlefield): CombatEvent[] {
    const { ability, team } = command;
    const abilityUseEvent = makeAbilityUseEvent(ability, team);
    abilityUseEvent.events.forEach(event => applyTeamEvent(team, event));
    const events = [abilityUseEvent];
    const getTeam = teamGetter(sides.A.concat(sides.B));

    for (const action of ability.actions) {
        if (!team.active || team.active.HP === 0) { // TODO or is stunned
            break;
        }

        const event = resolveAbilityAction(action, command, sides);
        event.events.forEach(e => applyTeamEvent(getTeam(e.team), e));
        events.push(event);
    }

    return events;
}

function makeAbilityUseEvent(ability: Ability, team: CombatTeam): CombatEvent {
    const { id, requirements } = ability;
    // Defend/mana costs are upfront. HP costs are treated like 'recoil' damage and apply at the end of the attack.
    const defendChargesChange = requirements?.defendCost || 0;
    const manaChange = requirements?.manaCost || 0;

    return {
        type: EventType.ABILITY_USE,
        source: id,
        events: [{
            team: team.id,
            defendChargesChange,
            manaChange
        }]
    };
}