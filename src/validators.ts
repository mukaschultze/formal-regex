
export type RegexStateResolver = (input: string[]) => boolean;
export type RegexStateResolvers = RegexStateResolver;

const wrap = (name: string, inside: RegexStateResolvers): RegexStateResolvers => {
    return (input) => {
        console.log("START", name);
        const r = inside(input);
        console.log("END", name, r);
        return r;
    }
}

export const emptyValidator: RegexStateResolvers = wrap("empty", (input) => {
    return true;
})

export const charValidator = (char: string): RegexStateResolvers => wrap(`char ${char}`, (input) => {
    if (char === input[0]) {
        input.shift();
        return true;
    } else {
        return false;
    }
})

export const anyValidator = (exp: RegexStateResolvers): RegexStateResolvers => wrap("any", (input) => {
    let i = 0;
    while (exp(input)) i++;
    return true;
})

export const orValidator = (a: RegexStateResolvers, b: RegexStateResolvers): RegexStateResolvers => wrap("or", (input) => {
    return a(input) || b(input);
})

export const groupValidator = (inside: RegexStateResolvers): RegexStateResolvers => wrap("group", (input) => {
    return inside(input);
})
