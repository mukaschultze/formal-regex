# Formal-Regex

# Alunos

- Samuel Shultze
- Gustavo Kessler

## Execução

- Necessario `nodejs14` e `npm` instalados
- `npm install` para instalar as dependencias
- `npm start` para executar
- O programa pergunta a expressão e a palavra a ser testada

## Gramática

- **EXPRESSION** -> SUBEXPRESSION SUBEXPRESSION | SUBEXPRESSION
- **SUBEXPRESSION** -> TERM '*' | TERM '+' EXPRESSION | TERM

- **TERM** ->  GROUP | TERMINAL
- **GROUP** -> '(' EXPRESSION ')'

- **TERMINAL** -> CHAR | EMPTY
- **CHAR** -> a-z A-Z
- **EMPTY** -> ɛ
