// Test with: npx tsx ./testStream.ts

import * as Stream from "./stream";
import {Letter, Transform, TransformLocation} from "./GameTypes";

/**************************************************/
// local utility functions
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

/**************************************************/
// Test data

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

const testTransforms:Array<Transform> = [
    {id:0, n: 10, input: "i", output:"n"},
    {id:1, n: 10, input: "n", output:"e"},
    {id:2, n: 1,  input: "win", output:"!"},
    {id:3, n: 1,  input: "in", output:""},
    {id:4, n: 1,  input: "foo", output:"bar"},
    {id:5, n: 1,  input: "baz", output:""},
    {id:6, n: 3,  input: "bar", output:"w"},
    {id:7, n: 1,  input: "cat", output:""},
];

/**************************************************/

const testStream = () => {
    let testInput:Array<Letter> = [];

    testInput = convertTestInput(testInputS);
    console.log(testInputS);
    console.log("\n------------\n")

    const outputWith1Letter = Stream.addLetter(testLetter, testInput);
    console.log(reConvertStream(outputWith1Letter));
    console.log("\n------------\n")

    const outputWithLetterCombo = Stream.applyLetterTransform(testLetterTranform, testInput, testLetterTransformLocation );
    console.log(reConvertStream(outputWithLetterCombo));
    console.log("\n------------\n")

    const outputWithWordCombo = Stream.applyWordTransform(testWordTranform, testInput, testWordTransformLocation );
    console.log(reConvertStream(outputWithWordCombo));
    console.log("\n------------\n")
    
    const scanLetters = Stream.scanForLetters(testInput, testTransforms);
    console.log(testTransforms);
    console.log(scanLetters);
    console.log("\n------------\n")

    const scanWords = Stream.scanForWords(testInput, testTransforms);
    console.log(scanWords);
}

testStream();
