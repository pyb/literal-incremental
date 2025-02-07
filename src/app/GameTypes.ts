export type DictItem = {
    id?: number,
    longDesc: string,
    shortDesc: string
};


/*
    Input data structure:
    Array of InputItem

*/
export type InputItem = {
    text: string,
    finished: boolean,
    isLetter: boolean,
    isWord: boolean,
    // isPrefix = !isLetter & !isWord 
    n: number, // >= 1

}

/*
Impl note for the buying system
keypresses produce 1 key if key is unlocked in keyboard
or 1 purchase ("10I -> N") if key is temp. unlocked/10I available
or a word purchase if it's Enter

We need to process input stream to see 1) what actions are available 2) what their outcome is
Classifying:
Keypress -> Add 1 letter to the end of input
Purchase letter : transform 1 input element into 1 or 2 others. i(15) -> i(5)n i(10) ->n
Purchase word: remove/reduce k consecutive input elements, where k is length of word. Maybe add l elements (the new word) after

Processing:
1) produce combo list. A list of DictItems that are applicable.
2) (input, combos, action -> input) : the transform. 
Action is a letter keypress or Enter

The base data structure is a sequence S of "letters(repetition number n)"
Every "frame", I Need to build up an easy-to-use list of words existing in it.

Hash table W : {word -> [location indices in S, from right to left, also noting multiplicity]},
List of words and isolated letters, in order for rendering/painting purposes

(S, dict)-> Hash Table L: "x times letter" reward available, ie note the locations of the 10I, etc
Hash table W update : {Dict Item ID -> [location indices in S, from right to left]}
And ID/location of the rightmost Dict Item. Or maybe a list of all the Dict Item IDs present, in order! There is overlap though.
Separate letter Dict Items and Word Dict Items to avoid overlap

bc What does Enter buy ? rightmost "Word" Dict Item
What does N buy? Rightmost 10I

Compute these Hash tables W, L, every frame for now
Use S = array for now

Later:
S should have easy subsequence insertion (word/letter replaced by word/letter, or word/letter added),
 mutability (decrease n by 1 within a range), 
Partially Recompute Hash tables and lists on modification of S
Keep a data structure of all the words present in S, update(not recompute) every frame

Operations on S:
-add 1 letter at the end
-remove a (multiple) letter
-remove a (multiple) word
-Add a letter at a location
-Add a word at a location
-Compute data structures above

After each frame, filter out all the n==0 letters

Should stream be linked list? It needs fast insert/delete
Test this with a wide range of keyboard keys and words available (not just INN)!

*/

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

/*

Q : separating into words. There can be ambiguity! Form the largest words? Or most multiple?
Overlapping words:
M(5)U(5)L(5)T(5)I(5) + N N 
-> MULT(5)I(4) INN? steal the last I?

first word formed?
Allow sharing? OK, but how does painting work?
I can recompute every time, only need to paint < 30 letters anyway?
Do I need to paint?
Overlapping words can be displayed by combo of colors, underlining, font, font weight, whatever

=> Done : see testsplit.ts for an implementation
no overlapping words for now.

*/

/*
    Arguments to Input component? 3 args at least:
    Letter array obvs. also delimited-word array? or list of word-starting indices?
    Yes, bc Input component shouldn't have access to dictionary.
    Does the current prefix/word being typed have special status? Yes. 
    3rd arg : index of current Input element being typed.    
*/