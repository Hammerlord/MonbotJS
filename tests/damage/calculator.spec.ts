import { calculateDamage, DamageCalculation } from '../../src/Combat/damage/calculator';
import { ElementCategory, Elements } from './../../src/Element/Elements';


describe('Damage calculator', () => {

    const character = {
        elements: [Elements.LIGHTNING],
        statusEffects: [],
        HP: 10,
        maxHP: 10,
        physicalAtt: 1,
        magicAtt: 1,
        physicalDef: 1,
        magicDef: 1
    } as any;

    const damageSource = {
        elements: [Elements.FIRE],
        elementCategory: ElementCategory.MAGIC,
        damageMultiplier: 1,
        damageBonus: null,
        isAbility: true
    };

    const noDamage = {
        effectivenessMultiplier: 0,
        sameTypeMultiplier: 0,
        totalDamage: 0,
        finalDamage: 0,
        overkill: 0,
        isBlocked: false,
        isAttack: false
    } as DamageCalculation;

    it('returns a record with damage details', () => {
        const result = calculateDamage(character, character, damageSource);
        expect(result).toEqual({
            effectivenessMultiplier: 1,
            sameTypeMultiplier: 1,
            totalDamage: 5,
            finalDamage: 5,
            overkill: 0,
            isBlocked: false,
            isAttack: true
        });
    });

    it('returns an empty record if the ability is not meant to do damage', () => {
        const actor = {
            ...character,
            elements: [Elements.FIRE]
        };
        const result = calculateDamage(actor, character,
            {
                ...damageSource,
                damageMultiplier: 0
            });

        expect(result).toEqual(noDamage);
    });

    it('returns an empty record if there was no target', () => {
        const result = calculateDamage(character, null, damageSource);
        expect(result).toEqual({
            ...noDamage,
            isAttack: true // The ability can still be an attack even if it does no damage.
        });
    });

    it('does at least 1 damage, if the ability is meant to do damage', () => {
        const target = {
            ...character,
            magicDef: 10000 // Yuuge magic defence
        };
        const result = calculateDamage(character, target, damageSource);
        expect(result).toEqual(jasmine.objectContaining({ finalDamage: 1 }));
    });

    it('applies damage reduction status effects', () => {
        const actor = { ...character, magicAtt: 10 };
        const result = calculateDamage(actor, character, damageSource);
        const damageReduction = 0.75;
        const defendingTarget = {
            ...character,
            statusEffects: [{ damageReduction }]
        };
        const defendingResult = calculateDamage(actor, defendingTarget, damageSource);
        const expected = Math.ceil(result.totalDamage * (1 - damageReduction));
        expect(defendingResult.totalDamage).toEqual(expected);
    });

    it('sets the isBlocked flag to true if damage was reduced by a damage reduction effect', () => {
        const actor = { ...character, magicAtt: 10 };
        const target = { ...character, statusEffects: [{ damageReduction: 0.5 }] };
        const result = calculateDamage(actor, target, damageSource);
        expect(result.isBlocked).toBe(true);
    });

    it('damage reduction caps at 100%', () => {
        const actor = { ...character, magicAtt: 10 };
        const target = { ...character, statusEffects: [{ damageReduction: 1.5 }] };
        const result = calculateDamage(actor, target, damageSource);
        expect(result.finalDamage).toEqual(0);
    });
});
