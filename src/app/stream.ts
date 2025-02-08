// Input stream operations

import {DictItem} from "./GameTypes"
/* 

* Input Operations:
Keypress -> Add 1 letter to the end of input
Purchase letter : transform 1 input element into 1 or 2 others. i(15) -> i(5)n i(10) ->n
Purchase word: remove/reduce k consecutive input elements, where k is length of word. Maybe add l elements (the new word) after

*/
function sreverse(s:string):string{
    return s.split("").reverse().join("");
}

type Letter = {
    text: string,
    n: number, // >= 1
}

const addLetter = (letter: string, input:Array<Letter>):Array<Letter> => {
    let result:Array<Letter> = [...input]; // clone
    if (input.length == 0)
        return [{text: letter, n: 1}];
    
    const lastLetter:Letter = result[-1];
    if (lastLetter.text != letter)
        result.push({text: letter, n: 1});
    else {
        result[-1].n++;
    }
    return result;
}

const applyLetterCombo = (combo: DictItem, input:Array<Letter>):Array<Letter>  => {
    let result:Array<Letter> = [...input];
    return result;
}

const applyWordCombo = (combo: DictItem, input:Array<Letter>):Array<Letter>  => {
    let result:Array<Letter> = [...input];
    return result;
}





// A Naive impl
// Input is now a simple string but will need to include multiplicities in the future

const scanS = (input:string, words:Array<string>) =>{
    // Return positions of words in input
    let result:Map<string, number>= new Map<string, number>();
    for (const w of words)
    {
        const k = input.indexOf(w) 
        if (k !== -1)
            result.set(w,k);
    }
}

const testDict:Set<string> = new Set<string>(["foo", "bar", "ire", "baz", "house", "fun", "squirrel", "in", "inn"]);
const testInput:string = "fobarfooinnhousesquirebabazin";

// Should this go left to right or right to left? Different outcomes.
const inputWordSplit = (input:string, dict:Set<string>) =>
{

}
