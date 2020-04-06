
import { MAX_ACTIVE_SKILLS } from '../constants';
import { Learnable } from './Ability';


function setAbilities(elemental, abilities: string[]) {
    elemental.activeAbilities = abilities.slice(0, MAX_ACTIVE_SKILLS);
}

export function getLearned(learnables: Learnable[], level: number): string[] {
    return learnables
    .filter(learnable => learnable.levelReq <= level)
    .map(learnable => learnable.id);
}

function changeAbility(elemental, i: number, abilityId: string) {
    const newAbilities = [...elemental.activeAbilities];
    if (i >= 0 && i < MAX_ACTIVE_SKILLS) {
        newAbilities[i] = abilityId;
    }
    elemental.activeAbilities = newAbilities;
}


