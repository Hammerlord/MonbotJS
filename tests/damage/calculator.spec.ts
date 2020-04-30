import { STAGE_BONUS } from './../../src/constants';
import { calculateDamage, DamageCalculation } from '../../src/Combat/damage/calculator';
import { ElementCategory, Elements } from './../../src/Element/Elements';


describe('Damage calculator', () => {

    const character = {
        elements: [Elements.LIGHTNING],
        statusEffects: [],
        HP: 10,
        maxHP: 10,
        physicalAtt: 5,
        magicAtt: 5,
        physicalDef: 5,
        magicDef: 5
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

    it('applies stat stages from status effects (physical attack)', () => {
        const buffedActor = { ...character, statusEffects: [{
            physicalAtt: 1,
            stacks: 1
        }] };

        const damage = { ...damageSource, elementCategory: ElementCategory.PHYSICAL };
        const unbuffedResult = calculateDamage(character, character, damage);
        const buffedResult = calculateDamage(buffedActor, character, damage);
        const expected = Math.ceil(unbuffedResult.finalDamage * (1 + STAGE_BONUS));
        expect(buffedResult.finalDamage).toEqual(expected);
    });

    it('applies stat stages from status effects (magic attack)', () => {
        const buffedActor = { ...character, statusEffects: [{
            magicAtt: 1,
            stacks: 1
        }] };

        const damage = { ...damageSource, elementCategory: ElementCategory.MAGIC };
        const unbuffedResult = calculateDamage(character, character, damage);
        const buffedResult = calculateDamage(buffedActor, character, damage);
        const expected = Math.ceil(unbuffedResult.finalDamage * (1 + STAGE_BONUS));
        expect(buffedResult.finalDamage).toEqual(expected);
    });

    it('applies stat stages from status effects (physical def)', () => {
        const buffedTarget = { ...character, statusEffects: [{
            physicalDef: 1,
            stacks: 1
        }] };

        const damage = { ...damageSource, elementCategory: ElementCategory.PHYSICAL };
        const unbuffedResult = calculateDamage(character, character, damage);
        const buffedResult = calculateDamage(character, buffedTarget, damage);
        const expected = Math.ceil(unbuffedResult.finalDamage * (1 - STAGE_BONUS));
        expect(buffedResult.finalDamage).toEqual(expected);
    });

    it('applies stat stages from status effects (magic def)', () => {
        const buffedTarget = { ...character, statusEffects: [{
            magicDef: 1,
            stacks: 1
        }] };

        const damage = { ...damageSource, elementCategory: ElementCategory.MAGIC };
        const unbuffedResult = calculateDamage(character, character, damage);
        const buffedResult = calculateDamage(character, buffedTarget, damage);
        const expected = Math.ceil(unbuffedResult.finalDamage * (1 - STAGE_BONUS));
        expect(buffedResult.finalDamage).toEqual(expected);
    });

    it('physical attack buffs do not affect magic abilities', () => {
        const buffedActor = { ...character, statusEffects: [{
            physicalAtt: 1,
            stacks: 1
        }] };

        const damage = { ...damageSource, elementCategory: ElementCategory.MAGIC };
        const unbuffedResult = calculateDamage(character, character, damage);
        const buffedResult = calculateDamage(buffedActor, character, damage);
        expect(buffedResult.finalDamage).toEqual(unbuffedResult.finalDamage);
    });

    it('magic attack buffs do not affect physical abilities', () => {
        const buffedActor = { ...character, statusEffects: [{
            magicAtt: 1,
            stacks: 1
        }] };

        const damage = { ...damageSource, elementCategory: ElementCategory.PHYSICAL };
        const unbuffedResult = calculateDamage(character, character, damage);
        const buffedResult = calculateDamage(buffedActor, character, damage);
        expect(buffedResult).toEqual(unbuffedResult);
    });

    it('physical def buffs do not affect magic attacks', () => {
        const buffedTarget = { ...character, statusEffects: [{
            physicalDef: 1,
            stacks: 1
        }] };

        const damage = { ...damageSource, elementCategory: ElementCategory.MAGIC };
        const unbuffedResult = calculateDamage(character, character, damage);
        const buffedResult = calculateDamage(character, buffedTarget, damage);
        expect(buffedResult).toEqual(unbuffedResult);
    });

    it('magic def buffs do not affect physical attacks', () => {
        const buffedTarget = { ...character, statusEffects: [{
            magicDef: 1,
            stacks: 1
        }] };

        const damage = { ...damageSource, elementCategory: ElementCategory.PHYSICAL };
        const unbuffedResult = calculateDamage(character, character, damage);
        const buffedResult = calculateDamage(character, buffedTarget, damage);
        expect(buffedResult).toEqual(unbuffedResult);
    });

    describe('Stat-based calculations', () => {

        it('can deal a percentage of target max HP', () => {
            const multiplier = 0.3;
            const target = {
                ...character,
                maxHP: 12
            };
            const result = calculateDamage(character, target, {
                ...damageSource,
                damageMultiplier: multiplier,
                calculation: {
                    calculationTarget: 'target',
                    stat: 'maxHP',
                    isFlat: true
                }
            });

            expect(result).toEqual({
                effectivenessMultiplier: 1,
                sameTypeMultiplier: 1,
                totalDamage: Math.ceil(target.maxHP * multiplier),
                finalDamage: Math.ceil(target.maxHP * multiplier),
                overkill: 0,
                isBlocked: false,
                isAttack: true
            });
        });

        it('can deal a percentage of actor health', () => {
            const multiplier = 0.2;
            const actor = {
                ...character,
                maxHP: 18
            };
            const result = calculateDamage(actor, character, {
                ...damageSource,
                damageMultiplier: multiplier,
                calculation: {
                    calculationTarget: 'actor',
                    stat: 'maxHP',
                    isFlat: true
                }
            });

            expect(result).toEqual({
                effectivenessMultiplier: 1,
                sameTypeMultiplier: 1,
                totalDamage: Math.ceil(actor.maxHP * multiplier),
                finalDamage: Math.ceil(actor.maxHP * multiplier),
                overkill: 0,
                isBlocked: false,
                isAttack: true
            });
        });

        it('can deal damage equal to the actor level', () => {
            const actor = {
                ...character,
                level: 10
            };

            const result = calculateDamage(actor, character, {
                ...damageSource,
                damageMultiplier: 1,
                calculation: {
                    calculationTarget: 'actor',
                    stat: 'level',
                    isFlat: true
                }
            });

            expect(result).toEqual({
                effectivenessMultiplier: 1,
                sameTypeMultiplier: 1,
                totalDamage: actor.level,
                finalDamage: actor.level,
                overkill: 0,
                isBlocked: false,
                isAttack: true
            });
        });
    });
});
