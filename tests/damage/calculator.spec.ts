import { calculateDamage } from '../../src/Combat/damage/calculator';
import { ElementCategory, Elements } from './../../src/Element/Elements';


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
