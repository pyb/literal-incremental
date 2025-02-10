// Test with: npx tsx ./test.ts

import * as Stream from "./stream";
import {Letter} from "./GameTypes";

const testInputS:string = "fobar(5)f(3)o(3)o(3)in(13)nbazhousesqui(10)rebaba(3)zi(5)n";


const convertTestInput = (input:string):Array<Letter> => {
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

const reConvertStream = (input:Array<Letter>):string => {
    return input.map((l:Letter) => (l.text + ((l.n == 1) ? "" : "(" + l.n.toString() + ")"))).join("");
} 

export const testStream = ():Array<string> => {
    let result:Array<string> = [];
    let testInput:Array<Letter> = [];

    testInput = convertTestInput(testInputS);
    const testOutput = Stream.addLetter("a", testInput);

    result.push(testInputS);
    result.push(reConvertStream(testOutput));
    return result;
}

for (const s of testStream()) {
    console.log(s);
    console.log('\n');
}
