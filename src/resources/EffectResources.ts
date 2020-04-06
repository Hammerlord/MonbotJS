import { Effect, EffectType } from '../Ability/Effect/Effect';
import { ElementCategory, Elements } from '../Element/Elements';
import * as uuid from 'uuid';

/** An effect object with common properties applied; override to customize */
const BASE_EFFECT = {
    type: EffectType.NONE,
    elementCategory: ElementCategory.PHYSICAL,
    elements: [Elements.NONE],
    isPrimaryTargetAffected: true,
    canBeDispelled: true,
    removeOnApplierKO: true,
    removeOnApplierSwitch: true,
    removeOnTargetSwitch: true,
    applyRefreshDuration: true,
    applyResetStacks: false,
    stacksPerTurn: 0
};

export const CLAW_BLEED = {
    ...BASE_EFFECT,
    id: uuid.v4(),
    type: EffectType.BLEED,
    maxDuration: 3,
    name: 'Claw Bleed',
    description: '',
    maxStacks: 3,
    canBeDispelled: false,
    icon: '',
    onRoundEnd: {
        damageMultiplier: 0.1
    }
} as Effect;

export const ENRAGE_EFFECT = {
    ...BASE_EFFECT,
    id: uuid.v4(),
    elementCategory: ElementCategory.PHYSICAL,
    elements: [Elements.FIRE],
    maxDuration: 3,
    name: 'Enrage',
    description: 'Gain physical and magic attack every round for 3 rounds.',
    maxStacks: 1,
    icon: ':anger:',
    onRoundEnd: {
        physicalAtt: 1,
        magicAtt: 1,
        recap: "%name%'s rage increases."
    },
    onEffectExpired: {
        recap: "%name%'s rage fades."
    }
} as Effect;

const ROLLING_THUNDER_EFFECT = {
    ...BASE_EFFECT,
    id: uuid.v4(),
    elementCategory: ElementCategory.MAGIC,
    elements: [Elements.LIGHTNING],
    maxDuration: 2,
    name: 'Rolling Thunder',
    description: 'Detonates at the end of the next round.',
    maxStacks: 1,
    icon: '',
    onEffectApplied: {
        recap: 'Dark clouds gather over %name%.'
    },
    onEffectExpired: {
        damageMultiplier: 1.5,
        recap: 'Storm clouds burst on %name%!'
    }
} as Effect;