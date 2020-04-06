import { Elements } from './../../Element/Elements';
import { effectivenessChart } from '../../Element/Effectiveness';

/**
 * Calculates the elemental effectiveness/resistance damage multiplier.
 */
export function calcEffectivenessBonus(elements: Elements[], against: Elements[]): number {
    const effectiveness = elements.reduce((acc, curr) => acc + effectivenessCoeff(curr, against), 0);
    return effectivenessMultiplier(effectiveness);
}

/**
 * Tallies the number of effectiveness/resistances per element.
 * Each `against` element weak to the comparator increases the coefficient by 1.
 * Each `against` element resisting the comparator decreases the coefficient by 1.
 * An element neutral to `against` elements returns 0.
 */
function effectivenessCoeff(element: Elements, against: Elements[]): number {
    return against.reduce((acc, elem) => {
        const { WEAK_TO, RESISTS } = effectivenessChart[elem];
        if (WEAK_TO.includes(element)) {
            return acc + 1;
        } else if (RESISTS.includes(element)) {
            return acc - 1;
        }
        return acc;
    }, 0);
}

/**
 * Translates the effectiveness coefficient into a damage multiplier.
 */
function effectivenessMultiplier(effectiveness: number): number {
    if (effectiveness >= 0) {
        return 1 + effectiveness * 0.5;
    }
    return 2 / (2 + Math.abs(effectiveness));
}