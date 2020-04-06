import { CombatTeam, TeamEvent, CombatEvent, EffectTarget } from './../models';
import { clamp } from 'ramda';
import { applyEffects } from '../../Ability/Effect/AppliedEffect';

export function applyEvent(getTeamById, event: CombatEvent) {
    event.events.forEach(e => applyTeamEvent(getTeamById(e.team), e));
}

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

        if (damage) {
            active.HP = clampHP(damage.finalDamage);
        }

        if (healing) {
            active.HP = clampHP(healing.finalHealing);
        }

        if (manaChange) {
            active.mana = clamp(0, active.maxMana, manaChange);
        }
    }

    if (effects) {
        const { applied, target, applier } = effects;
        if (active && target === EffectTarget.ACTIVE_ELEMENTAL) {
            active.statusEffects = applyEffects(applied, applier, team.active.statusEffects);
        } else if (target === EffectTarget.TEAM) {
            team.statusEffects = applyEffects(applied, applier, team.statusEffects);
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