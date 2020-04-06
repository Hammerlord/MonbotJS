import { CombatElemental } from './../../Elemental/CombatElemental';
import { Effect } from './Effect';
import { partition } from '../../utils';
import { getEffectById } from './EffectGateway';

export interface AppliedEffect extends Effect {
    icon: string;
    /** Rounds that this effect lasts for */
    duration: number;
    applier: string;
    isDispelled: boolean;
    isCanceled: boolean;
    stacks: number;
}

export function makeAppliedEffectFromId(effectId: string, applier: string): AppliedEffect | undefined {
    const effect = getEffectById(effectId);
    if (effect) {
        return makeAppliedEffect(effect, applier);
    }
}

/**
 * Create an instance of an effect to apply onto the target.
 * @param effect: The status effect to apply.
 * @param applier: ID of the applier
 * @param target: ID of the target
 */
export function makeAppliedEffect(effect: Effect, applier: string): AppliedEffect {
    return {
        ...effect,
        duration: effect.maxDuration,
        applier,
        isDispelled: false,
        isCanceled: false,
        stacks: 1
    };
}

export function applyEffects(
    effectIds: string[],
    applier: string,
    originalStatusEffects: AppliedEffect[]
): AppliedEffect[] {

    const effectsToApply = effectIds.reduce((acc, id) => acc[id] = true, {});

    // Check if an instance of the effect by the same applier already exists.
    // If so, refresh/add stack and move it to the end of the queue.
    // TODO effects like chill should always stack regardless of applier probably, but anyway...
    const [needsRefresh, leaveAlone] = partition(
        (effect: AppliedEffect) => effect.applier === applier && effectsToApply[effect.id],
        originalStatusEffects);

    const newEffects = effectIds
        .filter(id => needsRefresh.every(effect => effect.id !== id))
        .map(id => makeAppliedEffect(getEffectById(id), applier));

    return [...leaveAlone, ...needsRefresh.map(refreshEffect), ...newEffects];
}

function refreshEffect(effect: AppliedEffect): AppliedEffect {
    const { stacks, maxStacks, applyRefreshDuration, maxDuration, duration } = effect;
    return {
        ...effect,
        duration: applyRefreshDuration ? maxDuration : duration,
        stacks: (stacks < maxStacks) ? stacks + 1 : stacks
    };
}

function decrementEffectTimers(target: CombatElemental): void {
    target.statusEffects.forEach(effect => --effect.duration);
}

function removeEndedEffects(target: CombatElemental): AppliedEffect[] {
    const ended = effect => effect.duration <= 0 || effect.isDispelled || effect.isCanceled;
    const [removed, remaining] = partition(ended, target.statusEffects);
    target.statusEffects = remaining;
    return removed;
}