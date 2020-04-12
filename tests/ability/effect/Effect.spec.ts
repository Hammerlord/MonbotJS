import { applyEffects, makeAppliedEffect } from "../../../src/Ability/Effect/AppliedEffect";

describe('Effect application', () => {
    it('creates an effect on the target if not already existing', () => {
        const effect = {
            id: 'effectId',
            maxDuration: 3
        } as any;

        const result = applyEffects([effect], 'applier', []);
        expect(result).toEqual([{
            ...effect,
            duration: 3,
            applier: 'applier',
            isDispelled: false,
            isCanceled: false,
            stacks: 1
        }]);
    });

    it('refreshes an existing effect if configured', () => {
        const effect = {
            id: 'effectId',
            duration: 1,
            maxDuration: 3,
            applyRefreshDuration: true
        } as any;

        const result = applyEffects([effect], 'applier', []);
        expect(result).toEqual([
            jasmine.objectContaining({
                duration: 3
            })
        ]);
    });

    it('adds a stack to a refreshed effect if applicable', () => {
        const effect = {
            id: 'effectId',
            maxDuration: 3,
            maxStacks: 2
        } as any;

        const existing = makeAppliedEffect(effect, 'applier');
        const result = applyEffects([effect], 'applier', [existing]);
        expect(result).toEqual([
            jasmine.objectContaining({
                stacks: 2
            })
        ]);
    });

    it('caps at the max number of stacks', () => {
        const effect = {
            id: 'effectId',
            maxDuration: 3,
            stacks: 2,
            maxStacks: 2
        } as any;

        const existing = makeAppliedEffect(effect, 'applier');
        const result = applyEffects([effect], 'applier', [existing]);
        expect(result).toEqual([
            jasmine.objectContaining({
                stacks: effect.maxStacks
            })
        ]);
    });

    it('moves the refreshed effect to the end of the queue', () => {
        const effect = {
            id: 'effectId',
            maxDuration: 3,
            stacks: 2,
            maxStacks: 2
        } as any;

        const otherEffect = {
            ...effect,
            id: 'otherEffectId'
        } as any;

        const existing = [effect, otherEffect].map(e => makeAppliedEffect(e, 'applier'));
        const result = applyEffects([effect], 'applier', existing);
        const last = result[result.length - 1];
        expect(last).toEqual(
            jasmine.objectContaining({
                id: 'effectId'
            })
        );
    });

    it('creates a new instance of the same effect if the applier is different and !isSingleton', () => {
        // Eg. bleeds and HoTs, which vary by applier stats, shouldn't share the same effect instance.
        const effect = {
            id: 'effectId',
            maxDuration: 3,
            stacks: 1,
            maxStacks: 2,
            isSingleton: false
        } as any;

        const result = applyEffects(
            [effect],
            'applier',
            [makeAppliedEffect(effect, 'otherApplier')]
        );

        expect(result.length).toEqual(2);
        const last = result[result.length - 1];
        expect(last).toEqual(
            jasmine.objectContaining({
                ...effect,
                id: 'effectId',
                duration: effect.maxDuration,
                applier: 'applier'
            })
        );
    });

    it('allows different appliers to refresh the same effect instance if isSingleton = true', () => {
        const effect = {
            id: 'effectId',
            maxDuration: 3,
            maxStacks: 2,
            isSingleton: true,
            applyRefreshDuration: true
        } as any;

        const existingEffect = {
            ...makeAppliedEffect(effect, 'otherApplier'),
            duration: 1
        };

        const result = applyEffects(
            [effect],
            'applier',
            [existingEffect]
        );

        expect(result).toEqual([
            jasmine.objectContaining({
                duration: effect.maxDuration,
                stacks: effect.maxStacks
            })
        ]);
    });

    it('can refresh the correct effect, among multiple effects with different appliers', () => {
        const effect = {
            id: 'effectId',
            maxDuration: 3,
            stacks: 1,
            maxStacks: 2,
            isSingleton: false
        } as any;

        const result = applyEffects(
            [effect],
            'applier',
            [
                makeAppliedEffect(effect, 'applier'),
                makeAppliedEffect(effect, 'otherApplier'),
                makeAppliedEffect(effect, 'anotherApplier')
            ]
        );

        expect(result.length).toEqual(3);
        const last = result[result.length - 1];
        expect(last).toEqual(
            jasmine.objectContaining({
                ...effect,
                stacks: effect.stacks + 1,
                id: 'effectId',
                applier: 'applier'
            })
        );
    });
});