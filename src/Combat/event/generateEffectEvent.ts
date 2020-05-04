import { CombatElemental } from './../../Elemental/CombatElemental';
import { getActiveEffects } from "../CombatTeam";
import { calculateDamage } from "../damage/calculator";
import { calculateHealing } from "../healing/calculator";
import { applyTeamEvent } from "./applyEvent";
import { EffectEventTypes, EventType, CombatEvent, TeamEvent } from "./Event";
import { CombatTeam, EffectTarget } from "../models";

export function generateEffectEvents(
    triggered: EffectEventTypes,
    actingTeam: CombatTeam,
    findApplier: (id: string) => CombatElemental
): CombatEvent[] {

    const events = [];
    for (const effect of getActiveEffects(actingTeam)) {
        if (!actingTeam.active || actingTeam.active.HP <= 0) {
            break;
        }

        const triggeredEffect = effect[triggered];
        if (!triggeredEffect) {
            continue;
        }

        const { elementCategory, elements } = effect;
        const applier = findApplier(effect.applier);
        const event = {
            team: actingTeam.id,
            damage: calculateDamage(actingTeam.active, applier, {
                elements,
                elementCategory,
                damageMultiplier: triggeredEffect.damageMultiplier,
                isAbility: false
            }),
            healing: calculateHealing(actingTeam.active, applier, triggeredEffect.healing),
        };

        applyTeamEvent(actingTeam, event);
        events.push({
            type: EventType.EFFECT_TRIGGER,
            source: effect.id,
            events: [event]
        });
    }
    return events;
}
