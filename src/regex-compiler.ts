import { NFA, SyntacticNode } from "regex-expressions";
import { Token, tokenizeRegex } from "./tokenize";

let d = 0;
const logValue = (name: string, exp: Expression): Expression => {
    return (input) => {
        // console.log(name);
        const result = exp(input);
        // console.log(name, !!result, d);
        return result;
    }
}

type Expression = (input: TokenInput) => SyntacticNode | undefined;

// EXPRESSION -> SUBEXPRESSION EXPRESSION | SUBEXPRESSION
const expression: Expression = logValue("expression", (input) => {
    const sub = subexpression(input);

    if (!sub)
        return undefined;

    const other = expression(input);

    return other ?
        { type: "CONCAT", children: [sub, other] } :
        sub;
})

// SUBEXPRESSION -> TERM '*' | TERM '|' EXPRESSION | TERM
const subexpression: Expression = logValue("subexpression", (input) => {
    const t = term(input);

    if (!t)
        return undefined

    if (input.peek()?.tokenType === "ANY") {
        input.shift();
        return { type: "KLEEN-STAR", children: [t] };
    } else if (input.peek()?.tokenType === "OR") {
        input.shift();
        const rh = expression(input);

        if (!rh)
            throw new Error(`Expect valid expression at ${input.peek()?.tokenValue} (index ${input.peek()?.tokenIndex})`);

        return { type: "UNION", children: [t, rh] };
    } else {
        return t;
    }
})

// TERM ->  GROUP | TERMINAL
const term: Expression = logValue("term", (input) => {
    return group(input) || terminal(input);
})

// GROUP -> '(' EXPRESSION ')'
const group: Expression = logValue("group", (input) => {
    if (input.peek()?.tokenType === "PAREN_OPEN") {
        input.shift();

        const sub = expression(input);

        if (!sub)
            throw new Error(`Expected valid expression inside parenthesis at ${input.peek()?.tokenValue} (index ${input.peek()?.tokenIndex})`)

        if (input.peek()?.tokenType === "PAREN_CLOSE") {
            input.shift();
            return sub;
        }
    }
    return undefined;
})

// TERMINAL -> CHAR | EMPTY
const terminal: Expression = logValue("terminal", (input) => {
    return char(input) || empty(input);
})

// CHAR -> a-z A-Z
const char: Expression = logValue("char", (input) => {
    const token = input.peek();
    if (token?.tokenType === "CHAR") {
        input.shift();
        return { type: "LITERAL", literal: token.tokenValue, children: [] };
    }
})

// EMPTY -> ɛ
const empty: Expression = logValue("empty", (input) => {
    const token = input.peek();
    if (token?.tokenType === "EMPTY") {
        input.shift();
        return { type: "EMPTY", children: [] };
    }
})

type TokenInput = Token[] & { peek: () => Token | undefined };

export function compile(regex: string) {
    const tokens: TokenInput = tokenizeRegex(regex) as any;

    console.log("REGEX:", regex);
    console.log("TOKENS:", tokens.map(t => `${t.tokenType} (${t.tokenIndex})`).join(" "));

    tokens.peek = () => tokens[0];
    const syntacticTree = expression(tokens);

    // console.log(JSON.stringify(validator, null, 2));

    if (!syntacticTree)
        throw new Error(`Fail to parse expression at ${tokens.peek()?.tokenValue} (index ${tokens.peek()?.tokenIndex})`);

    const nfa = new NFA(syntacticTree);


    return syntacticTree ?
        (input: string) => {
            console.log("VALIDATING: ", input)
            return nfa.validate(input);
        } :
        () => false;
}