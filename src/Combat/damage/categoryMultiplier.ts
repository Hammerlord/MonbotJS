import { ElementCategory } from './../../Element/Elements';


/**
 * Based on an ability/effect's element category, compares an 
 * elemental's attack stat against the corresponding defense stat.
 */
export function categoryMultiplier(
    actor: { physicalAtt: number, magicAtt: number },
    target: { physicalDef: number, magicDef: number },
    elementCategory: ElementCategory
): number {
    if (elementCategory === ElementCategory.PHYSICAL) {
        return actor.physicalAtt / target.physicalDef;
    } else if (elementCategory === ElementCategory.MAGIC) {
        return actor.magicAtt / target.magicDef;
    }
    return 1;
}