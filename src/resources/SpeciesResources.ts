/**
 * @file Elemental Species models
 */
import uuid = require('uuid');
import { Elements } from '../Element/Elements';
import { CLAW } from './AbilityResources';

export const TOPHU = {
    id: uuid.v4(),
    name: 'Tophu',
    title: 'Light Mote',
    description: '',
    elements: [Elements.LIGHT],
    maxHP: 30,
    abilities: [
        {
            id: CLAW.id,
            levelReq: 0
        }
    ],
    passives: [],
    statGrowth: {
        maxHP: 3,
        physicalAtt: 2,
        magicAtt: 3,
        physicalDef: 3,
        magicDef: 3,
        speed: 1
    },
    leftIcon: '',
    rightIcon: '',
    portrait: ''
};

