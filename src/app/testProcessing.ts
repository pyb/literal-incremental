// Test with: npx tsx ./testProcessing.ts

import test from "node:test";
import {Trie} from "/home/pyb/rc/trie/trie";
import {TrieNode} from "/home/pyb/rc/trie/trieNode";

// test data
//const testInput:string = "fobarfooinnhousesquirebabazin";
//const testWords:Array<string> = ["foo", "bar", "baz", "house", "fun", "squire", "in", "inn"];

type Letter = {
    text: string,
    n: number, // >= 1
}

const testInputS:string = "fobar(5)f(3)o(3)o(3)in(13)nhousesqui(10)rebaba(3)zi(5)n";
let testInput:Array<Letter> = [];
const len = testInputS.length;
console.log("len: " + len.toString())

const convertTestInput = () => {
    for (let i: number = 0; i < len;) {
        const letter = testInputS[i];
        if (i > (len - 3) || testInputS[i + 1] != "(") {
            testInput.push({ text: letter, n: 1 });
            i++;
        }
        else {
            let k = i + 2;
            while (testInputS[k] != ")") {
                k++;
            }

            const n = Number(testInputS.slice(i + 2, k));
            testInput.push({ text: letter, n: n });
            i = k + 1;
        }
    }
}


// Triggers on n times word or letter. These will be DictItems in the future
type Combo = {
    n: number,
    input: string, // word or letter
    output: string,
};


// Compute
const testCombos:Array<Combo> = [
    {n: 10, input: "i", output:"n"},
    {n: 10, input: "n", output:"e"},
    {n: 1, input: "win", output:"!"},
    {n: 1, input: "in", output:""},
    {n: 1, input: "foo", output:"bar"},
    {n: 1, input: "baz", output:""},
    {n: 3, input: "bar", output:"w"},
];

//Hash Table L: "x times letter" reward available, ie note the locations of the 10I, etc
const computeL = (input: Array<Letter>, combos: Array<Combo>) => {
    let result: any = [];
    combos.forEach((combo: Combo, index: number) => {
        const comboLetter = combo.input;
        if (comboLetter.length == 1) {
            input.forEach((letter: Letter, k: number) => {
                if ((letter.text == comboLetter) &&
                    (letter.n >= combo.n)) {
                    result.push({ id: index, pos: k })
                }
            });
        }
    });

    return result;
}

console.log(testInputS)
convertTestInput();
//console.log(testInput)
console.log(testCombos)
const res = computeL(testInput, testCombos);
console.log(res)