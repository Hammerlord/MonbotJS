import { clamp } from 'ramda';
import { applyEffects } from '../../Ability/Effect/AppliedEffect';
import { getEffectById } from '../../Ability/Effect/EffectGateway';
import { CombatTeam, EffectTarget } from '../models';
import { TeamEvent } from './Event';

/**
 * This *mutates team* and returns it in its updated state.
 */
export function applyTeamEvent(team: CombatTeam, event: TeamEvent): CombatTeam {
    const { damage, healing, manaChange, defendChargesChange, forceSwitch, switchedWith, effects } = event;

    if (defendChargesChange) {
        team.defendCharges += defendChargesChange;
    }

    const { active } = team;
    if (active) {
        const clampHP = clamp(0, active.maxHP);
        const finalDamage = damage ? damage.finalDamage : 0;
        const finalHealing = healing ? healing.finalHealing : 0;
        const finalManaChange = manaChange || 0;

        active.HP = clampHP(active.HP - finalDamage + finalHealing);
        active.mana = clamp(0, active.maxMana, active.mana + finalManaChange);
    }

    if (effects) {
        const { applied, target, applier } = effects;
        const effectsToApply = applied.map(getEffectById);
        if (active && target === EffectTarget.ACTIVE_ELEMENTAL) {
            active.statusEffects = applyEffects(effectsToApply, applier, team.active.statusEffects);
        } else if (target === EffectTarget.TEAM) {
            team.statusEffects = applyEffects(effectsToApply, applier, team.statusEffects);
        }
    }

    if (forceSwitch) {
        team.active = null;
    }

    if (switchedWith) {
        team.active = team.elementals.find(({ id }) => id === switchedWith);
    }

    return team;
}