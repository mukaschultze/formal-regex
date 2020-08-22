import { compile } from "./regex-compiler";

// EXPRESSION -> SUBEXPRESSION SUBEXPRESSION | SUBEXPRESSION
// SUBEXPRESSION -> TERM '*' | TERM '+' EXPRESSION | TERM

// TERM ->  GROUP | TERMINAL
// GROUP -> '(' EXPRESSION ')'

// TERMINAL -> CHAR | EMPTY
// CHAR -> a-z A-Z
// EMPTY -> ɛ

// EXPRESSION   -> TERM EXPRESSSION'
// EXPRESSSION' -> '|' TERM EXPRESSSION' | EMPTY
// TERM         -> KLEEN TERM'
// TERM'        -> KLEEN TERM' | EMPTY
// KLEEN        -> TERMINAL | TERMINAL '*'
// TERMINAL     -> '(' EXPRESSION ')' | CHAR | EMPTY
// CHAR         -> a-z A-Z
// EMPTY        -> ɛ

function validate(input: string, regex: string) {
    const compiled = compile(regex);
    return compiled(input);
}

// console.log(validate("aa", "aa"))
// console.log(validate("baa", "ba*"))
// console.log(validate("abaababababbbababababab", "(a+b)*"))
// console.log(validate("ababababbbaaabbbbababab", "(a+b)*aa(a+b)*"))
// console.log(validate("aaaaaaaabaaaaaaaaaabaaaaaaaa", "a*ba*ba*"))
// console.log(validate("aaabaaba", "(a+b)*(aa+bb)"))
// console.log(validate("bbbbbbbaababbbbbbbabbbbb", "(a+ɛ)(b+ba)*"))
// console.log(validate("", "(a+ɛ)*"));
// console.log(validate("aaaaaaa", "(a+ɛ[]]"));