// Input stream operations

import {Transform, TransformLocation, Letter, Word} from "game/gameTypes"
import * as Util from "game/util"

/*
import {Trie} from "game/trie/trie";
import {TrieNode} from "game/trie/trieNode";
*/

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

const convertWordToString = (w:Array<Letter>):string => {
    return w.map((l:Letter) => l.text + "(" + l.n.toString()+ ")").join("");
}

/****************************************************************/
// Replace

// due to bugs/oversights in streamops we sometimes produce empty items or duplicated letters. Fix this: 
export const cleanupStream = (stream:Array<Letter>):Array<Letter> => {
    const filtered:Array<Letter> = [...stream].filter(
        (l:Letter) => (l.n > 0 && l.text));
    
    let i = 0;
    while (true) {
        const cur = filtered[i];
        const next = filtered[i+1];
        if (!cur || !next )
            break; 
        if (cur.text != next.text)
            i++;
        else {
            const newElement:Letter = {text: cur.text, n:cur.n + next.n};
            filtered.splice(i, 2, newElement);
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

// Maybe TODO if/when we implement word transform with multiplicity : this, but with letter multiplicities in word input.
  
/*
 New algo.
 "Stops" are letters not in the transform word.
 R to L : while not reaching a stop, process each letter (decrease its n and also the words Letter's n)
  [maybe copy the letter sequence till the next stop to a separate working area, and also the word]
  If reach a stop, fail. Cancel everything. jump to before the stop.
  If word is empty, success.  

*/
export type WordTransformResult = {
    result: Array<Letter>,
    destroyed?: Word,
    destroyedLocation?: number,
    success: boolean,
    length?: number,
    reordered?: Array<Letter>,
}

export const scanAndApplyWordTransform = (transform: Transform, stream:Array<Letter>)
    :WordTransformResult => {
    let result:Array<Letter> = structuredClone(stream);
    const word:Array<Letter> = compressSortedStream(convertStringToWord(transform.word as string).toSorted(sortWord));
    const wordLetters = new Set<string>(word.map((letter:Letter) => letter.text));

    let k:number = stream.length;
    let destroyed:Word|undefined;
    let destroyedLocation:number = 0;
    let success = false;
    let length:number = 0;
    let reorderedStream:Array<Letter> = [];

    while(k > 0)
    {
        const wordCopy:Array<Letter> = structuredClone(word);
        let i = k-1;
        if ( !wordLetters.has(result[i].text))
        {
            k = i;
            continue;
        }
        while ( i >= 0 &&
                wordLetters.has(result[i].text) )
            i--;
        
        const section:Array<Letter> = structuredClone(stream.slice(i+1,k));
        const secLength:number = section.length;

        for (let p = secLength - 1 ; p >= 0 ; p--)
        {
            const streamLetter:Letter = section[p];
            const wordLetter:Letter = wordCopy.find((l:Letter) => l.text == streamLetter.text) as Letter;
            const N = Math.min(streamLetter.n, wordLetter.n);
            streamLetter.n -= N;
            wordLetter.n -= N;
            if (!wordCopy.find((l:Letter) => l.n != 0))
                // It worked
            {
                success = true;
                break;
            }
        }
        if (success)
        {
            // Create reordered sections for the case where we don't want to actually apply the transform
            const reorderedSection:Array<Letter> =  section.toSorted(sortWord);
            reorderedStream = result.slice(0, i+1).concat(reorderedSection).concat(result.slice(k));

            destroyed = result.slice(i+1, secLength);
            destroyedLocation = i+1;
            result.splice(i+1, secLength, ...section);
            result.push(...convertStringToWord(transform.output));
            length = secLength;
            break;
        }
        k = i; 
    }
    return {
        result: cleanupStream(result),
        destroyed: destroyed,
        destroyedLocation: destroyedLocation,
        success: success,
        length: length,
        reordered: cleanupStream(reorderedStream),
    };
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
    const aLen:number = a.word.length;
    const bLen:number = b.word.length;
    const aEnd:number = a.location + aLen;
    const bEnd:number = b.location + bLen;

    if (aEnd != bEnd)
        return (bEnd-aEnd);
    else
        return (b.word.length - a.word.length);
}

const sortWord = (l1:Letter, l2:Letter):number => ((l1.text > l2.text) ? 1 : -1);

const compressSortedStream = (stream: Array<Letter>):Array<Letter> => {
    const result: Array<Letter> = structuredClone(stream);
   
    for (let i = 0; i < stream.length - 1 ; i++)
    {
        if (result[i].text == result[i+1].text)
        {
            result[i+1].n += result[i].n;
            result[i].n = 0;
        }
    }
    return result.filter((letter:Letter) => (letter.n != 0));
}

// 2) For each word in the transforms, look for its last occurence in the input
// Rewritten to account for for anagrams, and letter multiplicities ; eg the stream N(2)I should match the transform INN->...
export const scanForWords = (input: Array<Letter>, dict: Array<Transform>) => {
    const revInput:Array<Letter> = input.toReversed();
    let result:Array<TransformLocation> = [];

    // Note : this wd be a bug if a word transform existed that had only one repeated letter (eg AA -> ...)
    const wordTransforms:Array<Transform> = dict.filter(transform =>transform.word);
        
    wordTransforms.forEach((transform: Transform) => {
       const r:WordTransformResult = scanAndApplyWordTransform(transform, input);
       if (r.success)
       {
        result.push({ id: transform.id, location: r.destroyedLocation as number, length: r.length, word: transform.word as string });
       }
        
    })
    return result.sort(sortTransforms);
}

/****************************************************************/
// Rendering

// Backwards scan
// return indices where the Letter Array should be split ; and the original words
export const inputWordSplit = (input: Array<Letter>, dict: Array<Transform>)
        :[Array<number>, Array<string>] => {
    const resultPositions:Array<number> = [];
    const resultWords:Array<string> = [];
    const len:number = input.length;

    let k = len;
    resultPositions.push(len);
    while (k > 0)
    {
        const restInput:Array<Letter> = input.slice(0, k);
        const bwSortedWordPositions:Array<TransformLocation> = scanForWords(restInput, dict);
        
        const lastWord:TransformLocation = bwSortedWordPositions[0];
        if (!lastWord)
        {
            for (let i = k - 1; i >= 0 ; i--) {
                resultPositions.push(i); // single letters
                resultWords.push("");
            }
            k = 0;
        }
        else {
            for (let i = k ; i > (lastWord.location + (lastWord.length as number)); i--) {
                
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