
const ALPHABET = "qwertyuiopasdfghjklzxcvbnm QWERTYUIOPASDFGHJKLZXCVBNM".split("").sort();

const TOKENS: { [key: string]: TokenType } = {
    "*": "KLEEN-STAR",
    "|": "OR",
    "+": "OR",
    "(": "PAREN_OPEN",
    ")": "PAREN_CLOSE",
    "ø": "NULL",
    "ɛ": "EMPTY",
    "3": "EMPTY",
    ...ALPHABET.reduce((acc, cur) => ({ ...acc, [cur]: "CHAR" }), {})
};

export type TokenType = "NULL" | "EMPTY" | "KLEEN-STAR" | "OR" | "CHAR" | "PAREN_OPEN" | "PAREN_CLOSE"

export interface Token {
    tokenType: TokenType,
    tokenValue: string,
    tokenIndex: number,
}

export function tokenizeRegex(regex: string): Token[] {
    return regex.split("").map((c, idx) => {
        const tokenType = TOKENS[c];

        if (!tokenType)
            throw new Error(`Token desconhecido ${c} no índice ${idx}`);

        return {
            tokenType,
            tokenValue: c,
            tokenIndex: idx
        }
    });
}
