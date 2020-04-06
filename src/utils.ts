export function partition<T>(passes: (item: T) => boolean, list: T[]): T[][] {
    const pass = [];
    const fail = [];
    list.forEach(item => passes(item) ? pass.push(item) : fail.push(item));
    return [pass, fail];
}

export function coinFlip(): number {
    return Math.floor(Math.random() * Math.floor(2));
}