export type TokenType = "NULL" | "EMPTY" | "ANY" | "OR" | "CHAR" | "PAREN_OPEN" | "PAREN_CLOSE"

const ALPHABET = "qwertyuiopasdfghjklzxcvbnm QWERTYUIOPASDFGHJKLZXCVBNM".split("").sort();
const TOKENS: { [key: string]: TokenType } = {
    "*": "ANY",
    "|": "OR",
    "+": "OR",
    "(": "PAREN_OPEN",
    ")": "PAREN_CLOSE",
    "ø": "NULL",
    "ɛ": "EMPTY",
    ...ALPHABET.reduce((acc, cur) => ({ ...acc, [cur]: "CHAR" }), {})
};

export interface Token {
    tokenType: TokenType,
    tokenValue: string,
    tokenIndex: number,
}

export function tokenizeRegex(regex: string): Token[] {
    return regex.split("").map((c, idx) => {
        const tokenType = TOKENS[c];

        if (!tokenType)
            throw new Error(`Unknown token ${c} at ${idx}`);

        return {
            tokenType,
            tokenValue: c,
            tokenIndex: idx
        }
    });
}
