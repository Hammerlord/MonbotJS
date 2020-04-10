import { getActiveEffects } from "../src/Combat/CombatTeam";

describe('getActiveEffects', () => {
    it('combines the team and active elemental status effects', () => {
        const effect = { id: 'fake' } as any;
        const team = { active: { statusEffects: [effect] }, statusEffects: [effect] };
        const result = getActiveEffects(team);
        expect(result).toEqual([effect, effect]);
    });

    it('returns just the team status effects if there is no active elemental', () => {
        const effect = { id: 'fake' } as any;
        const team = { active: null, statusEffects: [effect] };
        const result = getActiveEffects(team);
        expect(result).toEqual([effect]);
    });
});