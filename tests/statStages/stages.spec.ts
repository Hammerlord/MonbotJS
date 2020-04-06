import { STAGE_BONUS, MAX_STAGES } from './../../src/constants';
import { sumStat, calculateStatStages } from "../../src/Combat/calculateStatStages";

describe('sumStat', () => {

    it('returns a sum of 0 if the team has no active elemental', () => {
        const team = {
            active: null,
            statusEffects: [{
                speed: 1,
                stacks: 1
            }]
        };

        expect(sumStat(team as any, 'speed')).toEqual(0);
    });

    it('applies stat stages from team buffs', () => {
        const team = {
            active: {
                speed: 10,
                statusEffects: []
            },
            statusEffects: [{
                speed: 1,
                stacks: 1
            }]
        };

        const expected = team.active.speed + (team.active.speed * STAGE_BONUS);
        expect(sumStat(team as any, 'speed')).toEqual(expected);
    });

    it('applies stat stages from active elemental buffs', () => {
        const team = {
            active: {
                speed: 10,
                statusEffects: [{
                    speed: 1,
                    stacks: 1
                }]
            },
            statusEffects: []
        };

        const expected = team.active.speed + (team.active.speed * STAGE_BONUS);
        expect(sumStat(team as any, 'speed')).toEqual(expected);
    });

    it('takes stacks of the buffs into account', () => {
        const team = {
            active: {
                speed: 10,
                statusEffects: [{
                    speed: 1,
                    stacks: 3
                }]
            },
            statusEffects: []
        };

        const expected = team.active.speed + (team.active.speed * STAGE_BONUS * 3);
        expect(sumStat(team as any, 'speed')).toEqual(expected);
    });

    it('calculates stat decreases correctly', () => {
        const team = {
            active: {
                speed: 10,
                statusEffects: [{
                    speed: -1,
                    stacks: 3
                }]
            },
            statusEffects: []
        };

        const expected = team.active.speed * Math.pow((1 - STAGE_BONUS), 3);
        expect(sumStat(team as any, 'speed')).toEqual(expected);
    });

    it('works with the various stats', () => {
        ['physicalAtt', 'magicAtt', 'physicalDef', 'magicDef', 'speed'].forEach(stat => {
            const team = {
                active: {
                    [stat]: 10,
                    statusEffects: [{
                        [stat]: 1,
                        stacks: 1
                    }]
                },
                statusEffects: []
            };

            const statAmount = team.active[stat] as number;
            const expected = statAmount + (statAmount * STAGE_BONUS);
            expect(sumStat(team as any, stat as any)).toEqual(expected);
        });
    });
});

describe('calculateStatStages', () => {

    it('limits the maximum number of stages (per config)', () => {
        const team = {
            active: {
                speed: 10,
                statusEffects: [{
                    speed: MAX_STAGES + 5,
                    stacks: 1
                }]
            },
            statusEffects: []
        };

        expect(calculateStatStages(team as any, 'speed')).toEqual(MAX_STAGES);
    });

    it('limits the maximum number of negative stages (per config)', () => {
        const team = {
            active: {
                speed: 10,
                statusEffects: [{
                    speed: -(MAX_STAGES + 5),
                    stacks: 1
                }]
            },
            statusEffects: []
        };

        expect(calculateStatStages(team as any, 'speed')).toEqual(-MAX_STAGES);
    });
});