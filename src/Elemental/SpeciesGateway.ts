import { Species } from './Species';
import { TOPHU } from "../resources/SpeciesResources";

const elementals = {
    [TOPHU.id]: TOPHU
};

export function getSpeciesById(id: string): Species | undefined {
    return elementals[id];
}