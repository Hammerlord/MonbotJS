import { ElementCategory } from './../../Element/Elements';


/**
 * Based on an ability/effect's element category, compares an
 * elemental's attack stat against the corresponding defense stat.
 */
export function getCategoryMultiplier(
    actor: { physicalAtt: number, magicAtt: number },
    target: { physicalDef: number, magicDef: number },
    elementCategory: ElementCategory
): number {
    const withFloor = (stat: number) => Math.max(1, stat);
    if (elementCategory === ElementCategory.PHYSICAL) {
        return withFloor(actor.physicalAtt) / withFloor(target.physicalDef);
    } else if (elementCategory === ElementCategory.MAGIC) {
        return withFloor(actor.magicAtt) / withFloor(target.magicDef);
    }
    return 1;
}