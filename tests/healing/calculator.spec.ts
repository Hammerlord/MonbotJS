import { calculateHealing } from "../../src/Combat/healing/calculator";
import { AbilityHealing } from "../../src/Ability/Ability";

describe('calculateHealing', () => {

    function multiply(sources: number[]): number {
        return Math.ceil(sources.reduce((acc, cur) => acc * cur));
    }

    const noHealing = {
        totalHealing: 0,
        overHealing: 0,
        finalHealing: 0
    };

    it('returns an empty record if the ability is not meant to heal', () => {
        const character = {
            maxHP: 10,
            statusEffects: []
        } as any;
        const result = calculateHealing(character, character, undefined);

        expect(result).toEqual(noHealing);
    });

    it('returns an empty record if there was no target to heal', () => {
        const character = {
            maxHP: 10,
            statusEffects: []
        } as any;

        const result = calculateHealing(character, null, {
            calculationType: 'flat',
            amount: 1
        } as any);

        expect(result).toEqual(noHealing);
    });

    describe('AbilityHealing configuration does not return invalid healing', () => {
        // The expectation here is that it doesn't explode.
        const character = {
            HP: 10,
            maxHP: 10,
            statusEffects: []
        } as any;

        const valid = {
            calculationTarget: 'target',
            stat: 'maxHP',
            amount: 10
        } as AbilityHealing;

        it('if calculationTarget property is invalid', () => {
            [null, 'notActor', ''].forEach((invalidValue: any) => {
                const result = calculateHealing(character, character, { ...valid, calculationTarget: invalidValue });
                expect(Object.values(result).every(value => !isNaN(value)));
            });
        });

        it('if amount is not provided', () => {
            const result = calculateHealing(character, character, {
                ...valid,
                amount: null
            });
            expect(Object.values(result).every(value => !isNaN(value)));
        });

        it('if the stat to base calculations on is invalid', () => {
            expect(calculateHealing(character, character, {
                ...valid,
                stat: 'invalid' as any
            })).toEqual(noHealing);

            expect(calculateHealing(character, character, {
                ...valid,
                calculationTarget: 'actor',
                stat: 'invalid' as any
            })).toEqual(noHealing);
        });
    });

    it('calculates flat healing', () => {
        const character = {
            HP: 1,
            maxHP: 10,
            statusEffects: []
        } as any;

        const healing = {
            amount: 10
        } as AbilityHealing;

        const result = calculateHealing(character, character, healing);
        expect(result).toEqual({
            totalHealing: 10,
            finalHealing: character.maxHP - character.HP,
            overHealing: character.HP,
        });
    });

    it('calculates percentage-based healing (usually based on maxHP)', () => {
        const character = {
            HP: 1,
            maxHP: 10,
            statusEffects: []
        } as any;

        const healingSource = {
            calculationTarget: 'actor',
            stat: 'maxHP',
            multiplier: 0.5
        } as AbilityHealing;

        const result = calculateHealing(character, character, healingSource);
        const expectedHealing = multiply([
            character.maxHP,
            healingSource.multiplier
        ]);

        expect(result).toEqual({
            totalHealing: expectedHealing,
            finalHealing: expectedHealing,
            overHealing: 0,
        });
    });

    describe('status effects', () => {
        const character = {
            HP: 1,
            maxHP: 10,
            statusEffects: []
        } as any;

        const healingSource = {
            calculationTarget: 'actor',
            stat: 'maxHP',
            multiplier: 0.5
        } as AbilityHealing;

        it('can increase healing done by the caster', () => {
            const healingDone = 0.5;
            const actor = {
                ...character,
                statusEffects: [{ healingDone }]
            };
            const result = calculateHealing(actor, character, healingSource);
            const expectedHealing = multiply([
                character.maxHP,
                healingSource.multiplier,
                1 + healingDone
            ]);

            expect(result).toEqual({
                totalHealing: expectedHealing,
                finalHealing: expectedHealing,
                overHealing: 0,
            });
        });

        it('can increase healing taken by the target', () => {
            const healingTaken = 0.5;
            const target = {
                ...character,
                statusEffects: [{ healingTaken }]
            };
            const result = calculateHealing(character, target, healingSource);
            const expectedHealing = multiply([
                target.maxHP,
                healingSource.multiplier,
                1 + healingTaken
            ]);

            expect(result).toEqual({
                totalHealing: expectedHealing,
                finalHealing: expectedHealing,
                overHealing: 0,
            });
        });

        it('can DECREASE healing taken by the target', () => {
            const healingTaken = -0.5;
            const target = {
                ...character,
                statusEffects: [{ healingTaken }]
            };
            const result = calculateHealing(character, target, healingSource);
            const expectedHealing = multiply([
                target.maxHP,
                healingSource.multiplier,
                1 + healingTaken
            ]);

            expect(result).toEqual({
                totalHealing: expectedHealing,
                finalHealing: expectedHealing,
                overHealing: 0,
            });
        });

        // There might eventually be decrease healing done by caster, but seems niche for now

        it('healingTaken does not increase healing done by the caster', () => {
            const healingTaken = 0.5;
            const actor = {
                ...character,
                statusEffects: [{ healingTaken }]
            };
            const result = calculateHealing(actor, character, healingSource);
            const expectedHealing = multiply([
                character.maxHP, healingSource.multiplier
            ]);

            expect(result).toEqual({
                totalHealing: expectedHealing,
                finalHealing: expectedHealing,
                overHealing: 0,
            });
        });

        it('healingDone does not increase healing taken by the target', () => {
            const healingDone = 0.5;
            const target = {
                ...character,
                statusEffects: [{ healingDone }]
            };
            const result = calculateHealing(character, target, healingSource);
            const expectedHealing = multiply([
                target.maxHP, healingSource.multiplier
            ]);

            expect(result).toEqual({
                totalHealing: expectedHealing,
                finalHealing: expectedHealing,
                overHealing: 0,
            });
        });

        it('adjust healing correctly if there are multiple effects', () => {
            const healingDone = 0.25;
            const actor = {
                ...character,
                statusEffects: [{ healingDone }]
            };
            const healingTaken = -0.5;
            const target = {
                ...character,
                statusEffects: [{ healingTaken }]
            };
            const result = calculateHealing(actor, target, healingSource);
            const expectedHealing = multiply([
                target.maxHP,
                healingSource.multiplier,
                1 + healingDone,
                1 + healingTaken
            ]);

            expect(result).toEqual({
                totalHealing: expectedHealing,
                finalHealing: expectedHealing,
                overHealing: 0,
            });
        });
    });

    it('calculates ability bonus', () => {
        // TODO: this calculator doesn't quite work right yet
    });
});