import * as chalk from "chalk";
import * as prompts from "prompts";
import { compile } from "./regex-compiler";

// EXPRESSION -> SUBEXPRESSION SUBEXPRESSION | SUBEXPRESSION
// SUBEXPRESSION -> TERM '*' | TERM '+' EXPRESSION | TERM

// TERM ->  GROUP | TERMINAL
// GROUP -> '(' EXPRESSION ')'

// TERMINAL -> CHAR | EMPTY
// CHAR -> a-z A-Z
// EMPTY -> ɛ

// console.log(validate("aa", "aa"))
// console.log(validate("baa", "ba*"))
// console.log(validate("abaababababbbababababab", "(a+b)*"))
// console.log(validate("ababababbbaaabbbbababab", "(a+b)*aa(a+b)*"))
// console.log(validate("aaaaaaaabaaaaaaaaaabaaaaaaaa", "a*ba*ba*"))
// console.log(validate("aaabaaba", "(a+b)*(aa+bb)"))
// console.log(validate("bbbbbbbaababbbbbbbabbbbb", "(a+ɛ)(b+ba)*"))
// console.log(validate("", "(a+ɛ)*"));
// console.log(validate("aaaaaaa", "(a+ɛ[]]"));

async function main() {
    while (true) {
        try {
            console.log(chalk.yellow("O token 'ɛ' pode ser representado por '3'\nEspaços são considerados como literais"));

            const questions: prompts.PromptObject<string>[] = [
                {
                    type: 'text',
                    name: 'regex',
                    message: 'Expressão regular',
                    initial: '(a+ɛ)(b+ba)*',
                },
                {
                    type: 'text',
                    name: 'input',
                    message: 'Texto para validar'
                }, {
                    type: 'confirm',
                    name: 'logNFA',
                    message: 'Mostrar a NFA e as transições?'
                },
            ];

            const { regex, input, logNFA } = await prompts(questions);
            const compiled = compile(regex);
            const matched = compiled(input, logNFA);

            console.log(`A palavra ${chalk.blue(input)} ${matched ? "" : chalk.red("NÃO ")}é validada por ${chalk.blue(regex)}`);
        } catch (err) {
            if (err instanceof Error)
                console.error(chalk.red(err.message));
            else
                console.error(chalk.red("ERRO DESCONHECIDO"));
        }
    }
}

main()
    .then()
    .catch((err: Error) => console.error(chalk.red(err.message)));