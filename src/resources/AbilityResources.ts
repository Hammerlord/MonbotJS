import { Ability, ActionPriority, TargetType } from '../Ability/Ability';
import uuid = require('uuid');
import { ElementCategory, Elements } from '../Element/Elements';

export const CLAW = {
    priority: ActionPriority.NORMAL,
    id: uuid.v4(),
    name: 'Claw',
    description: '',
    icon: '',
    actions: [{
        elementCategory: ElementCategory.PHYSICAL,
        elements: [Elements.NONE],
        damageMultiplier: 0.7,
        targetType: TargetType.ENEMY_ACTIVE
    }]
} as Ability;
