// Test with: npx tsx ./testStream.ts

import * as Stream from "./stream";
import {Letter, Transform, TransformLocation} from "./GameTypes";

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

const testInputS:string = "fobar(9)f(3)catoc(3)a(1)t(3)(3)o(3)in(13)nbazhousesqui(10)rebaba(3)zi(5)n";
const testLetter:string = "a";
const testLetterTranform:Transform = {
    id: 0,
    n: 5,
    input: "r",
    output: "n",
};
const testLetterTransformLocation:number = 4;

const testWordTranform:Transform = {
    id: 1,
    n: 1,
    input: "cat",
    output: "",
};
const testWordTransformLocation:number = 10;

export const testStream = ():Array<string> => {
    let result:Array<string> = [];
    let testInput:Array<Letter> = [];

    testInput = convertTestInput(testInputS);
    result.push(testInputS);

    //const outputWith1Letter = Stream.addLetter(testLetter, testInput);
    //result.push(reConvertStream(outputWith1Letter));

    //const outputWithLetterCombo = Stream.applyLetterTransform(testLetterTranform, testInput, testLetterTransformLocation );
    //result.push(reConvertStream(outputWithLetterCombo));

    const outputWithWordCombo = Stream.applyWordTransform(testWordTranform, testInput, testWordTransformLocation );
    result.push(reConvertStream(outputWithWordCombo));

    return result;
}

for (const s of testStream()) {
    console.log(s);
    console.log('\n');
}
