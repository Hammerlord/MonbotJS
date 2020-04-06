/**
 * @file Containing data for which elements are weak to or resist which other elements.
 * Used to, eg., calculate damage.
 */

import { Elements } from "./Elements";

export const effectivenessChart = {
    [Elements.FIRE]: {
        WEAK_TO: [Elements.WATER, Elements.WIND],
        RESISTS: [Elements.FIRE, Elements.EARTH, Elements.LIGHT]
    },
    [Elements.EARTH]: {
        WEAK_TO: [Elements.WATER, Elements.FIRE, Elements.CHAOS],
        RESISTS: [Elements.EARTH, Elements.LIGHTNING, Elements.WIND]
    },
    [Elements.WATER]: {
        WEAK_TO: [Elements.LIGHTNING, Elements.CHAOS],
        RESISTS: [Elements.WATER, Elements.EARTH, Elements.FIRE]
    },
    [Elements.LIGHTNING]: {
        WEAK_TO: [Elements.EARTH, Elements.CHAOS],
        RESISTS: [Elements.LIGHTNING, Elements.WIND, Elements.LIGHT]
    },
    [Elements.WIND]: {
        WEAK_TO: [Elements.EARTH, Elements.LIGHTNING, Elements.CHAOS],
        RESISTS: [Elements.WIND, Elements.FIRE]
    },
    [Elements.LIGHT]: {
        WEAK_TO: [Elements.DARK],
        RESISTS: [Elements.LIGHT, Elements.FIRE]
    },
    [Elements.DARK]: {
        WEAK_TO: [Elements.LIGHT, Elements.FIRE],
        RESISTS: [Elements.DARK, Elements.CHAOS]
    },
    [Elements.CHAOS]: {
        WEAK_TO: [Elements.DARK, Elements.LIGHT, Elements.CHAOS, Elements.FIRE],
        RESISTS: [Elements.EARTH, Elements.WATER, Elements.WIND, Elements.LIGHTNING]
    }
};