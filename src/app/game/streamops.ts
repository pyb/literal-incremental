// Input stream operations

import {Transform, TransformLocation, Letter} from "game/gameTypes"
import * as Util from "game/util"

import {Trie} from "game/trie/trie";
import {TrieNode} from "game/trie/trieNode";

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

/****************************************************************/
// Actions

// might be useful if we sometimes produce empty items
export const cleanupStream = (stream:Array<Letter>):Array<Letter> => {
    const filtered:Array<Letter> = [...stream].filter((l:Letter) => (l.n > 0 && l.text));
    let i = 0;
    while (true) {
        const cur = filtered[i];
        const next = filtered[i+1];
        if (!cur || !next )
            break; 
        if (cur.text != next.text)
            i++;
        else {
            cur.n += next.n;
            filtered.splice(i+1, 1);
            i+= 2;
        }
    }
    return filtered;
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
    const N = transform.n || 1;

    if(!existingLetter)
        throw new Error('Bug: bad letter');
    else if (existingLetter.n < N)
        throw new Error('Bug: bad transformation arguments : n too small!');
    if (existingLetter.n == N) {
        const prevLetter = result[location-1];
        if (prevLetter && prevLetter.text == newLetter.text) {
            const k = prevLetter.n;
            newLetter.n = k+1;
            result.splice(location - 1, 2, newLetter);
        }
        else
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

    return cleanupStream(result);
}

export const applyWordTransform = (transform: Transform, stream:Array<Letter>, location: number): Array<Letter> => {
    let result:Array<Letter> = [...stream];

    // TODO: this, but with letter multiplicities in word input.
    const word:string = transform.input;
    const output:string = transform.output;
    let i:number = 0;
    let k:number = 0;
    while (i < word.length) {
        let letter = result[location + k];
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

    return cleanupStream(result);
}

/****************************************************************/
// Scanning
// Bug: I had forgotten that some transform convert words into letters! Are they Letter Transforms?

// Hash Table L: "x times letter" reward available, ie note the locations of the 10I, etc
// Only return the rightmost letter transform for each letter
export const scanForLetters = (input: Array<Letter>, transforms: Array<Transform>): Map<string, TransformLocation> => {
    let result = new Map<string, TransformLocation>();
    transforms.forEach((transform: Transform, index: number) => {
        const transformLetter = transform.output;
        if (transformLetter.length == 1) {
            const inputWord:string = transform.input;
            if(inputWord.length == 1)
            {
                const l = input.length;
                input.toReversed().forEach((letter: Letter, k: number) => {
                    const pos = l - 1 - k;
                    const key: string = letter.text;
                    if ((key == inputWord) &&
                        (letter.n >= (transform.n || 1)))
                    {
                        const current = result.get(transformLetter);
                        if (!current ||
                            current.location < pos)
                            result.set(transformLetter, { id: index, word: key, location: pos });
                    }
                });
            }
            else { // "word to letter" transform. Convention : n is always 1. no "b(2)l(2)a(2) -> x" transforms
                const revWord = Util.sreverse(inputWord);
                const revInputS:string = inputToString(input.toReversed());
                const i = revInputS.indexOf(revWord);
                if (i != -1)
                {
                    const pos = (input.length - i) - inputWord.length;
                    result.set(transformLetter, {id: transform.id, location: pos, word: inputWord})
                }
            }
 
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

/****************************************************************/
// Rendering

// As the name implies, this scans backwards
// 
// can return -1 (beginning )
// Return (inclusive) index of where the next word starts
const bwNextWordOrLetterBoundary = (from: number, input:string, trie: Trie): number =>
{   
    if (from < 0)
        console.log("Error ! from < 0");

    if(!input[from])
        throw new Error('Bad input');
    let node:TrieNode = trie.prefixSearch(input[from]); // search for first letter

    let k = from - 1;
    let result = k;

    while (node && k >= 0)
    {
        if (node.isEndOfWord())
            result = k;
        const nextLetter = input[k];
        if(!nextLetter)
            throw new Error('Bad input');
        node = node.getChild(nextLetter);
        k -= 1;
    }

    return result;
}

// Should this go left to right or right to left? Different outcomes. For now, backwards
// return indices where the Letter Array should be split
export const inputWordSplit = (input:string, dict:Array<Transform>):Array<number> =>
{
    const backwardsWords = dict.map((transform:Transform) => transform.input)
        .filter((word:string) => word.length > 1)
        .map((word:string) => Util.sreverse(word));
    const backwardsTrie = new Trie();
    for (const word of backwardsWords)
        backwardsTrie.insert(word);

    let k = input.length - 1;
    let result:Array<number>= [k+1];

    while (k > 0)
    {
        const l:number = bwNextWordOrLetterBoundary(k, input, backwardsTrie);
        result.push(l+1);
        k = l;
    }
    // result.push(0); // could be useful, rn it's implicit that the first letter is the first boundary
    return (result.reverse());
}