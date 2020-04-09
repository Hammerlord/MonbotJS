import { categoryMultiplier } from '../../src/Combat/damage/categoryMultiplier';
import { calcEffectivenessBonus } from '../../src/Combat/damage/effectivenessBonus';
import { calcSameTypeBonus } from '../../src/Combat/damage/sameTypeBonus';
import { SAME_TYPE_BONUS } from './../../src/constants';
import { ElementCategory, Elements } from './../../src/Element/Elements';
import { calculateDamage } from '../../src/Combat/damage/calculator';


describe('Damage calculator', () => {

    const makeTeam = (stats = {}) => ({
        active: {
            elements: [Elements.LIGHTNING],
            statusEffects: [],
            physicalAtt: 1,
            magicAtt: 1,
            physicalDef: 1,
            magicDef: 1,
            ...stats
        },
        statusEffects: []
    });

    const damageSource = {
        elements: [Elements.FIRE],
        elementCategory: ElementCategory.MAGIC,
        damageMultiplier: 1,
        damageBonus: null
    };

    it('returns a record with damage details', () => {
        const actor = makeTeam() as any;
        const target = makeTeam() as any;
        const result = calculateDamage(actor, target, damageSource);

        expect(result).toEqual({
            effectivenessBonus: 1,
            sameTypeBonus: 1,
            abilityBonus: 1,
            finalDamage: 5,
            isBlocked: false
        });
    });

    it('returns an empty record if the ability is not meant to do damage', () => {
        const actor = makeTeam({ elements: [Elements.FIRE] }) as any; // Same type bonus
        const target = makeTeam() as any;
        const result = calculateDamage(actor, target,
            {
                ...damageSource,
                damageMultiplier: 0
            });

        expect(result).toEqual({
            effectivenessBonus: 0,
            sameTypeBonus: 0,
            abilityBonus: 0,
            finalDamage: 0,
            isBlocked: false
        });
    });

    it('returns an empty record if there was no target', () => {
        const result = calculateDamage(makeTeam() as any, null, damageSource);
        expect(result).toEqual({
            effectivenessBonus: 0,
            sameTypeBonus: 0,
            abilityBonus: 0,
            finalDamage: 0,
            isBlocked: false
        });
    });

    it('returns an empty record if target team has no active elemental', () => {
        const target = { active: null, statusEffects: [] } as any;
        const result = calculateDamage(makeTeam() as any, target, damageSource);
        expect(result).toEqual({
            effectivenessBonus: 0,
            sameTypeBonus: 0,
            abilityBonus: 0,
            finalDamage: 0,
            isBlocked: false
        });
    });

    it('does at least 1 damage, if the ability is meant to do damage', () => {
        const actor = makeTeam() as any;
        const target = makeTeam({ magicDef: 10000 }) as any; // Yuuge magic defence
        const result = calculateDamage(actor, target, damageSource);
        expect(result).toEqual(jasmine.objectContaining({ finalDamage: 1 }));
    });

    it('applies damage reduction status effects', () => {
        const actor = makeTeam({ magicAtt: 10 }) as any;
        const target = makeTeam() as any;
        const result = calculateDamage(actor, target, damageSource);
        const damageReduction = 0.5;
        const defendingTarget = makeTeam({ statusEffects: [{ damageReduction }] }) as any;
        const defendingResult = calculateDamage(actor, defendingTarget, damageSource);
        expect(defendingResult.finalDamage).toBeCloseTo(result.finalDamage * damageReduction);
    });

    it('sets the isBlocked flag to true if damage was reduced by a damage reduction effect', () => {
        const actor = makeTeam({ magicAtt: 10 }) as any;
        const target = makeTeam({ statusEffects: [{ damageReduction: 0.5 }] }) as any;
        const result = calculateDamage(actor, target, damageSource);
        expect(result.isBlocked).toBe(true);
    });

    it('damage reduction caps at 100%', () => {
        const actor = makeTeam({ magicAtt: 10 }) as any;
        const target = makeTeam({ statusEffects: [{ damageReduction: 1.5 }] }) as any;
        const result = calculateDamage(actor, target, damageSource);
        expect(result.finalDamage).toEqual(0);
    });
});

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

