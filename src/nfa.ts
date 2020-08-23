
export type RegexOP = "KLEEN-STAR" | "UNION" | "CONCAT" | "LITERAL" | "EMPTY";

export type SyntacticNode = {
    type: RegexOP,
    children: SyntacticNode[],
    literal?: string,
};

type StateNFA = {
    state: number,
    literal?: string,
    end?: boolean,
    transitions: Transition[]
}

type Transition = number | { char: string, target: number };

const EMPTY = "ɛ";

export class NFA {

    private automata: StateNFA[] = [
        { state: 0, transitions: [] },
        { state: 1, transitions: [], end: true },
    ];

    constructor(syntacticTree: SyntacticNode) {
        const [start, end] = this.getAutomata(syntacticTree);
        this.addTransition(0, start, EMPTY);
        this.addTransition(end, 1, EMPTY);
        // console.dir(this.automata, { depth: null });
    }

    private getAutomata(syntacticTree: SyntacticNode): [number, number] {
        switch (syntacticTree.type) {
            case "CONCAT":
                return this.concat(syntacticTree);
            case "KLEEN-STAR":
                return this.kleenStar(syntacticTree);
            case "UNION":
                return this.union(syntacticTree);
            case "LITERAL":
            case "EMPTY":
                return this.literal(syntacticTree);
        }
    }

    private addTransition(from: number, to: number, value: string) {
        this.automata[from].transitions.push(value === EMPTY ?
            to :
            { char: value, target: to });
    }

    private addState() {
        return this.automata.push({ state: this.automata.length, transitions: [] }) - 1;
    }

    private concat(node: SyntacticNode): [number, number] {
        const [lhStart, lhEnd] = this.getAutomata(node.children[0]);
        const [rhStart, rhEnd] = this.getAutomata(node.children[1]);
        this.addTransition(lhEnd, rhStart, EMPTY);
        return [lhStart, rhEnd];
    }

    private kleenStar(node: SyntacticNode): [number, number] {
        const [lhStart, lhEnd] = this.getAutomata(node.children[0]);
        const end = this.addState();

        this.addTransition(lhEnd, lhStart, EMPTY);
        this.addTransition(lhEnd, end, EMPTY);
        this.addTransition(lhStart, end, EMPTY);

        return [lhStart, end];
    }

    private union(node: SyntacticNode): [number, number] {
        const [lhStart, lhEnd] = this.getAutomata(node.children[0]);
        const [rhStart, rhEnd] = this.getAutomata(node.children[1]);

        const start = this.addState();
        const end = this.addState();

        this.addTransition(start, lhStart, EMPTY);
        this.addTransition(start, rhStart, EMPTY);
        this.addTransition(lhEnd, end, EMPTY);
        this.addTransition(rhEnd, end, EMPTY);

        return [start, end];
    }

    private literal(node: SyntacticNode): [number, number] {
        const start = this.addState();
        const end = this.addState();

        this.addTransition(start, end, node.literal || EMPTY);
        return [start, end];
    }

    public validate(input: string, logNFA: boolean) {

        if (logNFA)
            console.dir(this.automata, { depth: null });

        return this.recurseStates(0, input, 0, 0, logNFA);
    }

    public recurseStates(currentState: number, input: string, index: number, depth: number, logNFA: boolean): boolean {
        const log = (message?: any, ...optionalParams: any[]) => { if (logNFA) console.log(message, ...optionalParams) };
        const current = this.automata[currentState];
        const stateTransitions = current.transitions.filter(t => typeof t === "object") as { char: string, target: number }[];
        const emptyTransitions = current.transitions.filter(t => typeof t === "number") as number[];

        if (depth > 2000)
            return false; // Loop infinito

        if (current.end && index === input.length) {
            log("FIM");
            return true;
        }

        log("CURRENT STATE", currentState, current);

        for (const s of stateTransitions)
            if (s.char == input[index]) {
                log("READ", input[index]);
                if (this.recurseStates(s.target, input, index + 1, depth + 1, logNFA)) {
                    return true;
                } else {
                    log("UNREAD", input[index]);
                }
            }

        for (const s of emptyTransitions)
            if (this.recurseStates(s, input, index, depth + 1, logNFA))
                return true;

        return false;
    }

}
