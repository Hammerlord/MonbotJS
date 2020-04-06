import { ActionPriority } from './../../src/Ability/Ability';
import { CommandType } from './../../src/Combat/models';
import { prioritizeCommands } from '../../src/Combat/command/prioritizeCommands';

describe('prioritizeCommands', () => {

    it('correctly orders commands based on type', () => {
        // Switch > item > synchro > ability
        const ability = { type: CommandType.ABILITY, ability: { priority: ActionPriority.HIGH } };
        const switchAction = { type: CommandType.SWITCH };
        const item = { type: CommandType.ITEM };
        const synchro = { type: CommandType.SYNCHRO };
        const commands = [ability, synchro, switchAction, item] as any[];
        const expected = [switchAction, item, synchro, ability] as any[];
        expect(prioritizeCommands(commands)).toEqual(expected);
    });

    it('correctly orders ability commands based on ability priority', () => {
        const type = CommandType.ABILITY;
        const fast = { type, ability: { priority: ActionPriority.HIGH } };
        const defend = { type, ability: { priority: ActionPriority.DEFEND } };
        const slow = { type, ability: { priority: ActionPriority.LOW } };
        const normal = { type, ability: { priority: ActionPriority.NORMAL } };
        const commands = [normal, slow, fast, defend] as any[];
        const expected = [defend, fast, normal, slow] as any[];
        expect(prioritizeCommands(commands)).toEqual(expected);
    });

    it('orders ability commands based on elemental speed, if the ability priority is the same', () => {
        const base = {
            type: CommandType.ABILITY,
            ability: { priority: ActionPriority.HIGH }
        };

        /** Helper to make a stub team with the desired amount of speed */
        const makeTeam = (speed: number) => ({
            active: {
                speed,
                statusEffects: []
            },
            statusEffects: []
        });
        const slow = { ...base, team: makeTeam(5) };
        const fast = { ...base, team: makeTeam(10) };
        const faster = { ...base, team: makeTeam(15) };
        const commands = [fast, slow, faster] as any[];
        const expected = [faster, fast, slow] as any[];
        expect(prioritizeCommands(commands)).toEqual(expected);
    });
});