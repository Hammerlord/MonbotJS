import { BaseStat } from './../../src/Combat/calculateStatStages';
import { STAGE_BONUS, MAX_STAGES } from './../../src/constants';
import { calculateTotalStat, calculateStatStages } from "../../src/Combat/calculateStatStages";

describe('sumStat', () => {

    it('returns a sum of 0 if no character is supplied', () => {
        expect(calculateTotalStat(null, 'speed')).toEqual(0);
    });

    it('applies stat stages from active elemental buffs', () => {
        const character = {
            speed: 10,
            statusEffects: [{
                speed: 1,
                stacks: 1
            }]
        } as any;

        const expected = Math.ceil(character.speed + (character.speed * STAGE_BONUS));
        expect(calculateTotalStat(character, 'speed')).toEqual(expected);
    });

    it('takes stacks of the buffs into account', () => {
        const character = {
            speed: 10,
            statusEffects: [{
                speed: 1,
                stacks: 3
            }]
        } as any;

        const expected = Math.ceil(character.speed + (character.speed * STAGE_BONUS * 3));
        expect(calculateTotalStat(character, 'speed')).toEqual(expected);
    });

    it('calculates stat decreases correctly', () => {
        const character = {
            speed: 10,
            statusEffects: [{
                speed: -1,
                stacks: 3
            }]
        } as any;

        const expected = Math.ceil(character.speed * Math.pow((1 - STAGE_BONUS), 3));
        expect(calculateTotalStat(character, 'speed')).toEqual(expected);
    });

    it('works with the various stats', () => {
        ['physicalAtt', 'magicAtt', 'physicalDef', 'magicDef', 'speed'].forEach((stat: BaseStat) => {
            const character = {
                [stat]: 10,
                statusEffects: [{
                    [stat]: 1,
                    stacks: 1
                }]
            } as any;

            const statAmount = character[stat] as number;
            const expected = Math.ceil(statAmount + (statAmount * STAGE_BONUS));
            expect(calculateTotalStat(character, stat)).toEqual(expected);
        });
    });

    it('returns a minimum of 1 stat', () => {
        const character = {
            speed: 1,
            statusEffects: [{
                speed: -5,
                stacks: 3
            }]
        } as any;

        expect(calculateTotalStat(character, 'speed')).toEqual(1);
    });
});

describe('calculateStatStages', () => {

    it('limits the maximum number of stages (per config)', () => {
        const effects = [{
            speed: MAX_STAGES + 5,
            stacks: 1
        }];

        expect(calculateStatStages(effects as any, 'speed')).toEqual(MAX_STAGES);
    });

    it('limits the maximum number of negative stages (per config)', () => {
        const effects = [{
            speed: -(MAX_STAGES + 5),
            stacks: 1
        }];

        expect(calculateStatStages(effects as any, 'speed')).toEqual(-MAX_STAGES);
    });
});