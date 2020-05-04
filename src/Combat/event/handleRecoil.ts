import { CombatElemental } from './../../Elemental/CombatElemental';
import { Ability } from "../../Ability/Ability";
import { CombatEvent, EventType, EffectEventTypes } from './Event';
import { calculateDamage } from '../damage/calculator';
import { Elements, ElementCategory } from '../../Element/Elements';
import { CombatTeam } from '../models';
import { applyTeamEvent } from './applyEvent';
import { generateEffectEvents } from './generateEffectEvent';

export function handleRecoil(
    ability: Ability,
    team: CombatTeam,
    getElemental: (id: string) => CombatElemental
): CombatEvent[] {

    const events = [];
    const recoil = makeAbilityRecoilEvent(ability, team);
    if (recoil) {
        recoil.events.forEach(e => {
            applyTeamEvent(team, e);
            const { damage } = e;
            if (damage && damage.finalDamage) {
                events.push(...generateEffectEvents(EffectEventTypes.ON_RECEIVE_DAMAGE, team, getElemental));
            }
        });
        events.push(recoil);
    }
    return events;
}


function makeAbilityRecoilEvent(
    ability: Ability,
    team: { id: string, active: CombatElemental }
): CombatEvent | undefined {

    if (!ability.recoilDamage) {
        return;
    }

    return {
        type: EventType.ABILITY_RECOIL,
        source: ability.id,
        events: [{
            team: team.id,
            damage: calculateDamage(team.active, team.active, {
                elements: [Elements.NONE],
                elementCategory: ElementCategory.NONE,
                damageMultiplier: 1,
                calculation: {
                    amount: ability.recoilDamage
                },
                isAbility: false
            })
        }]
    };
}