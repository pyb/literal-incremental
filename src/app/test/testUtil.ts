import {Letter} from "game/gameTypes"

export const convertTestInput = (input:string):Array<Letter> => {
    const len = input.length;
    let output:Array<Letter> = [];
    for (let i: number = 0; i < len;) {
        const letter = input[i];
        if (!letter)
            throw new Error('Bug: array out of bounds');
        if (i > (len - 3) || input[i + 1] != "(") {
            output.push({ text: letter, n: 1 });
            i++;
        }
        else {
            let k = i + 2;
            while (input[k] != ")") {
                k++;
            }
            const n = Number(input.slice(i + 2, k));
            output.push({ text: letter, n: n });
            i = k + 1;
        }
    }
    return output;
}

export const reconvertTestStream = (input:Array<Letter>):string => {
    return input.map((l:Letter) => (l.text + ((l.n == 1) ? "" : "(" + l.n.toString() + ")"))).join("");
} 