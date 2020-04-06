import { Elements } from '../Element/Elements';
import { Learnable } from '../Ability/Ability';

export interface Stats {
    maxHP: number;
    physicalAtt: number;
    magicAtt: number;
    physicalDef: number;
    magicDef: number;
    speed: number;
}

export interface Species {
    id: string;
    name: string;
    title: string;
    description: string;
    elements: Elements[];
    maxHP: number;
    abilities: Learnable[];
    passives: Learnable[];
    /**
     * Stat skew per level. This is generally out of 15 total.
     */
    statGrowth: Stats;
    leftIcon: string; // Emoji facing left
    rightIcon: string; // Emoji facing right
    portrait: string; // Big picture
}