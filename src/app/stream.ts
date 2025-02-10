// Input stream operations

import {Transform, TransformLocation, Letter} from "./GameTypes"
import {sreverse} from "./util"

/* 

  Input Stream Ops:
-Actions
Keypress -> Add 1 letter to the end of input
Purchase letter : transform 1 input element into 1 or 2 others. i(15) -> i(5)n i(10) ->n
Purchase word: remove/reduce k consecutive input elements, where k is length of word. Maybe add l elements (the new word) after
-Rendering helper
Separate into words for UI/rendering (arbitrary)
-Transform filters
Transform filter L: What letter Transforms are available, and their positions.  Dict Item ID -> first location in S
Transform filter W: What words are available.  {Dict Item ID -> [location indices in S, from right to left ; or first location?]}

// Mutate or not? not allowed
*/

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

// might be useful if we sometimes produce empty items
const cleanupStream = (stream:Array<Letter>) => {
    return [...stream].filter((l:Letter) => (l.n > 0 && l.text));
}

const applyLetterTransform = (transform: Transform, stream:Array<Letter>, location: number): Array<Letter> => {
    if (stream[location].text != transform.input) // sanity check
        throw new Error('Bug: bad transformation arguments! Bad letter');
    
    let result:Array<Letter> = [...stream];
    const N = transform.n;

    const newLetter:Letter = {text: transform.output, n: 1};

    if (result[location].n == N) {
        result.splice(location, 1, newLetter );
    }
    else if (result[location].n > N)
    {
        result[location].n -= N;
        result.splice(location+1, 0, newLetter );
    }
    else
        throw new Error('Bug: bad transformation arguments : n too small!');
    return result;
}

const applyWordTransform = (transform: Transform, stream:Array<Letter>, location: number): Array<Letter> => {
    let result:Array<Letter> = [...stream];

    const word = transform.input;
    const output = transform.output;
    let i:number = 0;
    while (i < word.length) {
        if (result[location + i].text != word[i])
            throw new Error('Bug: bad transformation arguments! Bad word letter');
        if (result[location + i].n == 1) { 
            result.splice(location + i, 1); // delete the Letter in place
        }
        else {
            result[location + i].n -= 1;
            i++;
        }
    }
    const letters = [...output].map((l: string):Letter => { return {text:l, n:1} });
    result.splice(location + i, 0, ...letters);

    return result;
}

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

