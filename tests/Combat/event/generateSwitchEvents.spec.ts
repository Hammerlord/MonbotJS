import { ElementCategory, Elements } from './../../../src/Element/Elements';
import { AppliedEffect } from './../../../src/Ability/Effect/AppliedEffect';
import { EffectType } from './../../../src/Ability/Effect/Effect';
import { generateSwitchEvents } from "../../../src/Combat/event/generateSwitchEvents";
import { CombatTeam, CommandType } from "../../../src/Combat/models";
import { EventType } from "../../../src/Combat/event/Event";
import { CombatElemental } from '../../../src/Elemental/CombatElemental';

const elemental = {
    id: 'id',
    elements: [Elements.FIRE],
    level: 5,
    physicalAtt: 15,
    magicAtt: 15,
    physicalDef: 15,
    magicDef: 15,
    HP: 100,
    maxHP: 100,
    statusEffects: [],
} as CombatElemental;

const effect = {
    applier: 'applier',
    elementCategory: ElementCategory.MAGIC,
    elements: [Elements.FIRE]
} as AppliedEffect;

const baseTeam = {
    id: 'id',
    owner: 'owner',
    hasForfeit: false,
    defendCharges: 2,
    statusEffects: [],
    active: elemental,
    elementals: [elemental]
} as CombatTeam;


describe('generateSwitchEvents', () => {

    it('returns the switch event as the first event in the array', () => {
        const switchedWith = { ...elemental, id: 'switched-with' };

        const team = {
            ...baseTeam,
            elementals: [elemental, switchedWith]
        };

        const result = generateSwitchEvents(() => team, () => elemental,
            {
                team,
                switchedWith: switchedWith.id
            }
        );

        expect(result[0]).toEqual({
            type: EventType.SWITCH,
            source: null,
            events: [{
                team: team.id,
                switchedWith: switchedWith.id,
            }]
        });
    });

    it('can trigger onSwitchIn effects, which eg. deal damage to the effect owner', () => {
        const switchedWith = { ...elemental, id: 'switched-with' };

        const team = {
            ...baseTeam,
            elementals: [elemental, switchedWith],
            statusEffects: [
                {
                    ...effect,
                    onSwitchIn: {
                        affects: 'target',
                        damageMultiplier: 1
                    }
                }
            ] as AppliedEffect[]
        };

        const result = generateSwitchEvents(() => team, () => elemental,
            {
                team,
                switchedWith: switchedWith.id
            }
        );

        expect(result.length).toEqual(2);
        expect(result[1]).toEqual({
            type: EventType.EFFECT_TRIGGER,
            source: effect.id,
            events: [{
                team: team.id,
                damage: jasmine.objectContaining({
                    totalDamage: jasmine.any(Number)
                }),
                healing: jasmine.any(Object)
            }]
        });
    });

    it('if none of the status effects have onSwitchIn triggers, returns just the switch event', () => {
        const effectTrigger = {
            affects: 'target',
            damageMultiplier: 1
        };

        const switchedWith = {
            ...elemental,
            id: 'switched-with',
            statusEffects: [
                { ...effect, onAbility: effectTrigger },
                { ...effect, onTurnEnd: effectTrigger },
            ] as AppliedEffect[],
        };

        const team = {
            ...baseTeam,
            elementals: [elemental, switchedWith]
        };

        const result = generateSwitchEvents(
            () => team,
            () => elemental,
            {
                team,
                switchedWith: switchedWith.id
            }
        );

        expect(result.length).toEqual(1);
        expect(result[0]).toEqual({
            type: EventType.SWITCH,
            source: null,
            events: [{
                team: team.id,
                switchedWith: switchedWith.id,
            }]
        });
    });

    it('triggers onEnemySwitchIn effects (from the opponent)', () => {
        // TODO...
    });

    it('succeeds even if the active elemental is knocked out', () => {
        const switchedWith = { ...elemental, id: 'switched-with' };
        const active = {
            ...elemental,
            HP: 0
        };

        const team = {
            ...baseTeam,
            active,
            elementals: [active, switchedWith]
        };

        const result = generateSwitchEvents(() => team, () => elemental,
            {
                team,
                switchedWith: switchedWith.id
            }
        );

        expect(result[0]).toEqual({
            type: EventType.SWITCH,
            source: null,
            events: [{
                team: team.id,
                switchedWith: switchedWith.id,
            }]
        });
    });

    it('succeeds even if the active elemental is null', () => {
        const switchedWith = { ...elemental, id: 'switched-with' };
        const team = {
            ...baseTeam,
            active: null,
            elementals: [elemental, switchedWith]
        };

        const result = generateSwitchEvents(() => team, () => elemental,
            {
                team,
                switchedWith: switchedWith.id
            }
        );

        expect(result[0]).toEqual({
            type: EventType.SWITCH,
            source: null,
            events: [{
                team: team.id,
                switchedWith: switchedWith.id,
            }]
        });
    });
});