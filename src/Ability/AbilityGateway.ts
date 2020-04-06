import { Ability } from './Ability';
import { CLAW } from '../resources/AbilityResources';

const abilities = {
    [CLAW.id]: CLAW,
};

export function getAbilityById(id: string): Ability {
    return abilities[id];
}

