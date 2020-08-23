import * as chalk from "chalk";
import { NFA, SyntacticNode } from "./nfa";
import { Token, tokenizeRegex } from "./tokenize";

type TokenStack = Token[] & { peek: () => Token | undefined };
type Expression = (input: TokenStack) => SyntacticNode | undefined;

// EXPRESSION -> SUBEXPRESSION EXPRESSION | SUBEXPRESSION
const expression: Expression = (input) => {
    const sub = subexpression(input);

    if (!sub)
        return undefined;

    const other = expression(input);

    return other ?
        { type: "CONCAT", children: [sub, other] } :
        sub;
}

// SUBEXPRESSION -> TERM '*' | TERM '|' EXPRESSION | TERM
const subexpression: Expression = (input) => {
    const t = term(input);

    if (!t)
        return undefined

    if (input.peek()?.tokenType === "KLEEN-STAR") {
        input.shift();
        return { type: "KLEEN-STAR", children: [t] };
    } else if (input.peek()?.tokenType === "OR") {
        input.shift();
        const rh = expression(input);

        if (!rh)
            throw new Error(`Esperado expressão valida no token ${input.peek()?.tokenValue} (índice ${input.peek()?.tokenIndex})`);

        return { type: "UNION", children: [t, rh] };
    } else {
        return t;
    }
}

// TERM ->  GROUP | TERMINAL
const term: Expression = (input) => {
    return group(input) || terminal(input);
}

// GROUP -> '(' EXPRESSION ')'
const group: Expression = (input) => {
    if (input.peek()?.tokenType === "PAREN_OPEN") {
        input.shift();

        const sub = expression(input);

        if (!sub)
            throw new Error(`Esperado expressão válida dentro dos parênteses no token ${input.peek()?.tokenValue} (índice ${input.peek()?.tokenIndex})`)

        if (input.peek()?.tokenType === "PAREN_CLOSE") {
            input.shift();
            return sub;
        }
    }
}

// TERMINAL -> CHAR | EMPTY
const terminal: Expression = (input) => {
    return char(input) || empty(input);
}

// CHAR -> a-z A-Z
const char: Expression = (input) => {
    const token = input.peek();
    if (token?.tokenType === "CHAR") {
        input.shift();
        return { type: "LITERAL", literal: token.tokenValue, children: [] };
    }
}

// EMPTY -> ɛ
const empty: Expression = (input) => {
    const token = input.peek();
    if (token?.tokenType === "EMPTY") {
        input.shift();
        return { type: "EMPTY", children: [] };
    }
}

function formatSyntacticTree(node: SyntacticNode): string {
    if (node.literal)
        return `"${node.literal}"`;
    else if (node.children.length == 0)
        return `${node.type}`;
    else
        return `${node.type} ( ${node.children.map(c => formatSyntacticTree(c)).join(", ")} )`;
}

export function compile(regex: string) {
    const tokens: TokenStack = tokenizeRegex(regex) as any;

    console.log(chalk.green("REGEX:"), regex);
    console.log(chalk.green("TOKENS:"), tokens.map(t => t.tokenType).join(" "));

    tokens.peek = () => tokens[0];

    const syntacticTree = expression(tokens);

    if (!syntacticTree || tokens.length > 0) {
        if (tokens.length > 0)
            throw new Error(`Falha no parse da expressão no token ${tokens.peek()?.tokenValue} (índice ${tokens.peek()?.tokenIndex})`);
        else
            throw new Error(`Expressão com final inesperado`);
    }

    console.log(chalk.green("SYNTACTIC TREE:"), formatSyntacticTree(syntacticTree));

    const nfa = new NFA(syntacticTree);

    return syntacticTree ?
        (input: string, logNFA: boolean) => nfa.validate(input, logNFA) :
        () => false;
}