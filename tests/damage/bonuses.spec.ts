import { categoryMultiplier } from '../../src/Combat/damage/categoryMultiplier';
import { calcEffectivenessBonus } from '../../src/Combat/damage/effectivenessBonus';
import { calcSameTypeBonus } from '../../src/Combat/damage/sameTypeBonus';
import { SAME_TYPE_BONUS } from './../../src/constants';
import { ElementCategory, Elements } from './../../src/Element/Elements';

describe('Same type bonus', () => {

    it('is granted when the element is the same', () => {
        expect(calcSameTypeBonus([Elements.WATER], [Elements.WATER])).toEqual(SAME_TYPE_BONUS);
    });

    it('is not granted when the elements do not match', () => {
        expect(calcSameTypeBonus([Elements.WATER], [Elements.FIRE])).toEqual(1);
    });

    it('is a flat amount regardless if multiple elements match', () => {
        const calculated = calcSameTypeBonus([Elements.WATER, Elements.FIRE], [Elements.WATER, Elements.FIRE]);
        expect(calculated).toEqual(SAME_TYPE_BONUS);
    });
});

describe('Category multiplier', () => {

    it('compares physical attack against physical def if the category is physical', () => {
        const actor = { physicalAtt: 50 } as any;
        const target = { physicalDef: 20 } as any;
        expect(categoryMultiplier(actor, target, ElementCategory.PHYSICAL)).toEqual(50 / 20);
    });

    it('compares magic attack against magic def if the category is magic', () => {
        const actor = { magicAtt: 50 } as any;
        const target = { magicDef: 20 } as any;
        expect(categoryMultiplier(actor, target, ElementCategory.MAGIC)).toEqual(50 / 20);
    });

    it('returns 1 if no category was supplied', () => {
        const actor = { magicAtt: 50 } as any;
        const target = { magicDef: 20 } as any;
        expect(categoryMultiplier(actor, target, undefined)).toEqual(1);
    });
});

describe('Effectiveness bonus', () => {

    it('returns a damage increase multiplier when the element is super effective', () => {
        expect(calcEffectivenessBonus([Elements.WATER], [Elements.FIRE])).toBeGreaterThan(1);
    });

    it('returns a damage reduction multiplier when the element is resisted', () => {
        expect(calcEffectivenessBonus([Elements.FIRE], [Elements.WATER])).toBeLessThan(1);
    });

    it('returns 1 if the elements are neutral to each other', () => {
        expect(calcEffectivenessBonus([Elements.FIRE], [Elements.LIGHTNING])).toEqual(1);
    });

    it('returns an increasing multiplier based on increasing number of elemental weaknesses', () => {
        const single = calcEffectivenessBonus([Elements.WATER], [Elements.FIRE]);
        const double = calcEffectivenessBonus([Elements.WATER], [Elements.FIRE, Elements.EARTH]);
        const triple = calcEffectivenessBonus([Elements.CHAOS], [Elements.LIGHTNING, Elements.EARTH, Elements.WIND]);
        expect(double).toBeGreaterThan(single);
        expect(triple).toBeGreaterThan(double);
    });

    it('returns a decreasing multiplier based on number of resisted elements', () => {
        const single = calcEffectivenessBonus([Elements.FIRE], [Elements.WATER]);
        const double = calcEffectivenessBonus([Elements.FIRE], [Elements.WATER, Elements.WIND]);
        expect(double).toBeLessThan(single);
    });
});

