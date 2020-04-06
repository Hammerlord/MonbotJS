import { SAME_TYPE_BONUS } from './../../constants';
import { Elements } from './../../Element/Elements';

/**
 * Calculate multiplier for damage bonus when a user has the same element(s) as the ability used.
 */
export function calcSameTypeBonus (elements: Elements[], comparators: Elements[]): number {
    const comparatorMap = comparators.reduce((acc, current) => ({...acc, [current]: true}), {});
    if (elements.some(element => comparatorMap[element])) {
        return SAME_TYPE_BONUS;
    }
    return 1;
}