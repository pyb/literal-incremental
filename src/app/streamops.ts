// Input stream operations

import {Transform, TransformLocation, Letter} from "./GameTypes"
import * as Util from "./util"

/* 
  Input Stream Ops: Actions and Scans.
-Actions:
Keypress -> Add 1 letter to the end of input
Purchase letter : transform 1 input element into 1 or 2 others. i(15) -> i(5)n i(10) ->n
Purchase word: remove/reduce k consecutive input elements, where k is length of word. Maybe add l elements (the new word) after

-Scans:
Transform filter "L": What letter Transforms are available, and their positions.  Dict Item ID -> first location in S
Transform filter "W": What words are available.  {Dict Item ID -> [location indices in S, from right to left ; or first location?]}

-Rendering helper (TODO: copy/test from testSplit.js): Separate into words for UI/rendering (arbitrary)

*/

// might be useful if we sometimes produce empty items
export const cleanupStream = (stream:Array<Letter>) => {
    return [...stream].filter((l:Letter) => (l.n > 0 && l.text));
}

export const addLetter = (letter: string, input: Array<Letter>): Array<Letter> => {
    let result: Array<Letter> = [...input]; // clone
    const lastLetter = result.at(-1);
    if (!lastLetter)
        return [{ text: letter, n: 1 }];

    if (lastLetter.text != letter)
        result.push({ text: letter, n: 1 });
    else {
        lastLetter.n++;
    }
    return result;
}

export const applyLetterTransform = (transform: Transform, stream:Array<Letter>, location: number): Array<Letter> => {
    if (!stream[location] || stream[location].text != transform.input) // sanity check
        throw new Error('Bug: bad transformation arguments! Bad letter');
    
    let result:Array<Letter> = [...stream];
    
    const newLetter:Letter = {text: transform.output, n: 1};
    let existingLetter = result[location];
    const N = transform.n;

    if(!existingLetter)
        throw new Error('Bug: bad letter');
    else if (existingLetter.n < N)
        throw new Error('Bug: bad transformation arguments : n too small!');
    if (existingLetter.n == N) {
        result.splice(location, 1, newLetter );
    }
    else if (existingLetter.n > N)
    {
        const letter:Letter = {
            text: existingLetter.text,
            n: existingLetter.n - N
        };
        result.splice(location, 1, letter, newLetter );
    }

    return result;
}

export const applyWordTransform = (transform: Transform, stream:Array<Letter>, location: number): Array<Letter> => {
    let result:Array<Letter> = [...stream];

    const word = transform.input;
    const output = transform.output;
    let i:number = 0;
    let k:number = 0;
    while (i < word.length) {
        let letter = result[location + k];
        console.log(letter)
        if(!letter)
            throw new Error('Bug: out of bounds');
        if (letter.text != word[i])
            throw new Error('Bug: bad transformation arguments! Bad word letter');
        if (letter.n == 1) { 
            result.splice(location + k, 1); // delete the Letter in place
        }
        else {
            const updatedLetter:Letter = {
                text: letter.text,
                n: letter.n - 1
            };
            result.splice(location + k, 1, updatedLetter);
            //letter.n -= 1;
            k++;
        }
        i++;
    }
    const letters = [...output].map((l: string):Letter => { return {text:l, n:1} });
    result.splice(location + i, 0, ...letters);

    return result;
}

//Hash Table L: "x times letter" reward available, ie note the locations of the 10I, etc
// Only return the rightmost letter transform for each letter
export const scanForLetters = (input: Array<Letter>, transforms: Array<Transform>): Map<string, TransformLocation> => {
    let result = new Map<string,  TransformLocation>();
    transforms.forEach((transform: Transform, index: number) => {
        const transformLetter = transform.output;
        if (transformLetter.length == 1) {
            const l = input.length;
            input.toReversed().forEach((letter: Letter, k: number) => {
                const pos = l - 1 - k;
                const key: string = letter.text;
                if ((key == transform.input) &&
                    (letter.n >= transform.n))
                {
                    const current = result.get(key);
                    if (!current ||
                        current.location < pos)
                        result.set(transformLetter, { id: index, word: key, location: pos });
                }
            });
        }
    });
    return result;
}

const inputToString = (input: Array<Letter>):string => {
    return input.map((letter: Letter) => letter.text).join('');
}

// 2) For each word in the transform, look for its last occurence in the input
export const scanForWords = (input: Array<Letter>, transforms: Array<Transform>):Array<TransformLocation> => {
    const revInputS:string = inputToString(input.toReversed());
    let result:Array<TransformLocation> = [];

    const wordTransforms = transforms.filter((transforms) => transforms.input.length > 1);
    wordTransforms.forEach((transform:Transform) => {
        const word = transform.input;
        const revWord = Util.sreverse(word);
        const i = revInputS.indexOf(revWord);
        if (i != -1)
        {
            const pos = (input.length - i) - word.length;
            result.push({id: transform.id, location: pos, word: word})
        }
    });
    return result.sort((a, b) => (b.location - a.location)); // the rightmost words come first
}


/*
// Kinda do this, but backwards
const scanForLettersBackwards = (input:string, words:Array<string>) =>{
    // Return positions of words in input
    let result:Map<string, number>= new Map<string, number>();
    for (const w of words)
    {
        const k = input.indexOf(w) 
        if (k !== -1)
            result.set(w,k);
    }
}
*/


// A Naive impl
// Input is now a simple string but will need to include multiplicities in the future

/*
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
*/

