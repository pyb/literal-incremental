// Input stream operations

import {Transform, TransformLocation, Letter} from "game/gameTypes"
import * as Util from "game/util"

import {Trie} from "game/trie/trie";
import {TrieNode} from "game/trie/trieNode";

/* 
  Input Stream Ops: Actions (Substitutions aka Replace) and Scans. (aka Search)
-Actions:
Keypress -> Add 1 letter to the end of input
Purchase letter : transform 1 input element into 1 or 2 others. i(15) -> i(5)n i(10) ->n
Purchase word: remove/reduce k consecutive input elements, where k is length of word. Maybe add l elements (the new word) after

-Scans:
Transform filter "L": What letter Transforms are available, and their positions.  Dict Item ID -> first location in S
Transform filter "W": What words are available.  {Dict Item ID -> [location indices in S, from right to left ; or first location?]}

-Rendering helper (TODO: copy/test from testSplit.js): Separate into words for UI/rendering (arbitrary)
*/

// Utility. WINNER converts to WIN(2)ER
const convertStringToWord = (s:string):Array<Letter> => {
    const result:Array<Letter> = [];
    let k = 0;
    for (let i = 0; i < s.length ; i++)
    {
        if (i > 1 && s[i-1] == s[i])
        {
            result[k-1].n+= 1;
        }
        else {
            const l:Letter = {text: s[i] as string, n : 1}
            result.push(l);
            k+=1;
        }
    }
    return result;
}

/****************************************************************/
// Replace

// due to bugs/oversights in streamops we sometimes produce empty items or duplicated letters. Fix this: 
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
            //cur.n += next.n;
            const newElement:Letter = {text: cur.text, n:cur.n + next.n};
            filtered.splice(i, 2, newElement);
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
    return cleanupStream(result);
}

export const applyLetterTransform = (transform: Transform, stream:Array<Letter>, location: number): Array<Letter> => {
    if (!stream[location] || ! transform.letter || stream[location].text != transform.letter) // sanity check
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
    const word:Array<Letter> = convertStringToWord(transform.word as string);

    const output:string = transform.output;
    let i:number = 0;
    let k:number = 0;
    while (i < word.length) {
        let letter = result[location + k];
        if(!letter)
            throw new Error('Bug: out of bounds');
        if (letter.text != word[i].text)
            throw new Error('Bug: bad transformation arguments! Bad word letter');
        if (letter.n == word[i].n) { 
            result.splice(location + k, 1); // delete the Letter in place
        }
        else {
            const updatedLetter:Letter = {
                text: letter.text,
                n: letter.n - word[i].n
            };
            result.splice(location + k, 1, updatedLetter);
            k++;
        }
        i++;
    }
    const letters = [...output].map((l: string):Letter => { return {text:l, n:1} });
    result.splice(location + i, 0, ...letters);

    return cleanupStream(result);
}

/****************************************************************/
// Search
// Bug: I had forgotten that some transform convert words into letters! Are they Letter Transforms?

// Hash Table L: "x times letter" reward available, ie note the locations of the 10I, etc
// Only return the rightmost letter transform for each letter
export const scanForLetters = (input: Array<Letter>, transforms: Array<Transform>): Map<string, TransformLocation> => {
    let result = new Map<string, TransformLocation>();
    transforms.forEach((transform: Transform) => {
        const transformLetter = transform.output;
        if (transformLetter.length == 1) {
            if(transform.letter)
            {
                const l = input.length;
                input.toReversed().forEach((letter: Letter, k: number) => {
                    const pos = l - 1 - k;
                    const key: string = letter.text;
                    if ((key == transform.letter) &&
                        (letter.n >= (transform.n || 1)))
                    {
                        const current = result.get(transformLetter);
                        if (!current ||
                            current.location < pos)
                            result.set(transformLetter, { id: transform.id, word: key, location: pos });
                    }
                });
            }
            else if (transform.word){ // "word to letter" transform. Convention : n is always 1. no "b(2)l(2)a(2) -> x" transforms
                const revWord = Util.sreverse(transform.word);
                const revInputS:string = inputToString(input.toReversed());
                const i = revInputS.indexOf(revWord);
                if (i != -1)
                {
                    const pos = (input.length - i) - transform.word.length;
                    result.set(transformLetter, {id: transform.id, location: pos, word: transform.word})
                }
            }
            else
                console.log("Error : Transform " + transform.id.toString() + " does nothing!")
 
        }
    });
    return result;
}

const inputToString = (input: Array<Letter>):string => {
    return input.map((letter: Letter) => letter.text).join('');
}

// This behaviour will probably be updated 
// For now we prioritise rightmost transform, unless a longer transform exists using the same letters
// We could change to : always pick the longest word.
const sortTransforms = (a:TransformLocation, b:TransformLocation) => {
    //console.log("sorting " + a.word + " at " + a.location.toString() + " vs " + b.word + " at " + b.location.toString());
    const aLen:number = a.word.length;
    const bLen:number = b.word.length;
    const aEnd:number = a.location + aLen;
    const bEnd:number = b.location + bLen;

    if (aEnd != bEnd)
        return (bEnd-aEnd);
    else
        return (b.word.length - a.word.length);
}

// 2) For each word in the transforms, look for its last occurence in the input
export const scanForWords = (input: Array<Letter>, transforms: Array<Transform>, maxLength: number = NaN):
        Array<TransformLocation> => {
    const revInput:Array<Letter> = input.toReversed();
    const revInputS:string = inputToString(revInput);
    let result:Array<TransformLocation> = [];

    // Note : this wd be a bug if a word transform existed that had only one repeated letter (eg AA -> ...)
    const wordTransforms:Array<Transform> = transforms.filter((transform) =>
        (transform.word &&
        (isNaN(maxLength) || (transform.word.length < maxLength))));

    wordTransforms.forEach((transform: Transform) => {
        let pos:number = NaN;
        transform.words?.forEach((word: string) => {
            const revWordS: string = Util.sreverse(word);
            //const wordA: Array<Letter> = convertStringToWord(word);
            //const revWordA: Array<Letter> = wordA.toReversed();
            const i = revInputS.indexOf(revWordS);
            let pos:number = NaN;
            if (i != -1) {
                /*
                // unused
                let flag = true;
              
                // Check multiplicities
                for (let k = 0; k < word.length; k++) {
                    if (revInput[i + k].n < revWordA[k].n) {
                        flag = false;
                        break;
                    }
                }
                
                if (flag) {
                */
                //console.log("found " + word + " in " + Util.sreverse(revInputS))
                const newPos = (input.length - i) - word.length;
                if (isNaN(pos))
                    pos = newPos;
                else
                    pos = Math.max(pos, newPos);
                //}
            }
        if (pos)
            result.push({ id: transform.id, location: pos, word: transform.word as string})
        });
    });
    return result.sort(sortTransforms); // the rightmost words come first
}

/****************************************************************/
// Rendering

// Backwards scan
// return indices where the Letter Array should be split ; and the original words
export const inputWordSplit = (input: Array<Letter>, dict: Array<Transform>): [Array<number>, Array<string>] => {
    const resultPositions:Array<number> = [];
    const resultWords:Array<string> = [];
    const len:number = input.length;

    let k = len;
    resultPositions.push(len);
    while (k > 0)
    {
        const restInput:Array<Letter> = input.slice(0, k);
        const bwSortedWordPositions:Array<TransformLocation> = scanForWords(restInput, dict);
        
        const lastWord = bwSortedWordPositions[0];
        if (!lastWord)
        {
            for (let i = k - 1; i >= 0 ; i--) {
                resultPositions.push(i); // single letters
                resultWords.push("");
            }
            k = 0;
        }
        else {
            for (let i = k ; i > (lastWord.location + lastWord.word.length); i--) {
                resultPositions.push(i - 1); // single letters
                resultWords.push("");
            }
            resultPositions.push(lastWord.location);
            k = lastWord.location;
            resultWords.push(lastWord.word);
        }
    }
    resultWords.push(""); // otherwise it's off by 1
    return [resultPositions.toReversed(), resultWords.toReversed()];
}