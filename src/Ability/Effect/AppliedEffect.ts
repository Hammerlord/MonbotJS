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
    effects: Effect[],
    applier: string,
    originalStatusEffects: AppliedEffect[]
): AppliedEffect[] {

    const original = originalStatusEffects.reduce((acc, effect) => {
        if (!acc[effect.id]) {
            acc[effect.id] = {};
        }
        acc[effect.id][effect.applier] = effect;
        return acc;
    }, {});

    const refreshed = [];

    effects.forEach(effect => {
        if (!original[effect.id]) {
            // No instance of this effect exists.
            refreshed.push(makeAppliedEffect(effect, applier));
            return;
        }

        if (effect.isSingleton) {
            // There should be one instance of this effect.
            const existingEffect = Object.values(original[effect.id])[0] as AppliedEffect;
            refreshed.push(refreshEffect(existingEffect, applier));
            delete(original[effect.id]);
            return;
        }

        // Only refresh the effect if it was applied by the same elemental.
        const existingEffect = original[effect.id][applier];
        if (existingEffect) {
            refreshed.push(refreshEffect(existingEffect, applier));
            delete(original[effect.id][applier]);
            return;
        }

        refreshed.push(makeAppliedEffect(effect, applier));
    });

    const notRefreshed = effect => original[effect.id] && original[effect.id][effect.applier];
    return [
        ...originalStatusEffects.filter(notRefreshed),
        ...refreshed
    ];
}

function refreshEffect(effect: AppliedEffect, applier: string): AppliedEffect {
    const { stacks, maxStacks, applyRefreshDuration, maxDuration, duration } = effect;
    return {
        ...effect,
        applier,
        duration: applyRefreshDuration ? maxDuration : duration,
        stacks: Math.min(stacks + 1, maxStacks)
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