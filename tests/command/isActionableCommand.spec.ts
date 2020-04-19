import { isActionableAbilityCommand } from "../../src/Combat/command/isActionableCommand";
import { TargetType } from './../../src/Ability/Ability';

describe('isActionableAbility', () => {

    const baseActiveElemental = {
        id: 'id',
        HP: 100,
        maxHP: 100,
        mana: 2,
        maxMana: 20,
        statusEffects: []
    };
    Object.freeze(baseActiveElemental);

    it('is false if the acting team has no active elemental (eg. due to force switch)', () => {
        const command = {
            team: { active: null },
            originalActive: 'id'
        } as any;

        const isActionable = isActionableAbilityCommand(() => true, command);
        expect(isActionable).toBe(false);
    });

    it('is false if the active elemental is not the same as the one originally using the ability', () => {
        const command = {
            team: {
                active: {
                    id: 'not the same'
                }
            },
            originalActive: 'id'
        } as any;

        const isActionable = isActionableAbilityCommand(() => true, command);
        expect(isActionable).toBe(false);
    });

    it('is false if the team active elemental is dead', () => {
        const command = {
            team: {
                active: {
                    ...baseActiveElemental,
                    HP: 0
                }
            },
            originalActive: baseActiveElemental.id
        } as any;

        const isActionable = isActionableAbilityCommand(() => true, command);
        expect(isActionable).toBe(false);
    });

    it('is false if the ability cannot be used (eg. due to lack of resources)', () => {
        const command = {
            team: {
                active: {
                    ...baseActiveElemental,
                    mana: 0
                },
                statusEffects: []
            },
            originalActive: baseActiveElemental.id,
            ability: {
                requirements: { manaCost: 1 }
            }
        } as any;

        const isActionable = isActionableAbilityCommand(() => true, command);
        expect(isActionable).toBe(false);
    });

    it('is false if there are no valid targets', () => {
        const command = {
            team: {
                active: baseActiveElemental,
                statusEffects: []
            },
            originalActive: baseActiveElemental.id,
            ability: {
                actions: [
                    { targetType: TargetType.ENEMY_TEAM }
                ]
            },
            slot: 0
        } as any;

        const hasValidTargets = () => false;
        const isActionable = isActionableAbilityCommand(hasValidTargets, command);
        expect(isActionable).toBe(false);
    });

    it('is true if the ability can be used and target is valid', () => {
        const command = {
            team: {
                active: baseActiveElemental,
                statusEffects: []
            },
            originalActive: baseActiveElemental.id,
            ability: {
                actions: [
                    { targetType: TargetType.ENEMY_TEAM }
                ]
            },
            slot: 0
        } as any;

        const hasValidTargets = () => true;
        const isActionable = isActionableAbilityCommand(hasValidTargets, command);
        expect(isActionable).toBe(true);
    });
});