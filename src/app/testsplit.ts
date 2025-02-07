// Test with: npx tsx ./testsplit.ts

import {Trie} from "/home/pyb/rc/trie/trie";
import {TrieNode} from "/home/pyb/rc/trie/trieNode";


function sreverse(s:string):string{
    return s.split("").reverse().join("");
}

//const testDict:Set<string> = new Set<string>(testWords);
//const inputWordSplit= (input:string, dict:Set<string>):Array<number> =>

// As the name implies, this scans backwards
// 
// can return -1 (beginning )
// Return (inclusive) index of where the next word starts
const bwNextWordOrLetterBoundary = (from: number, input:string, trie: Trie): number =>
{   
    if (from < 0)
        console.log("Error ! from < 0");


    let node:TrieNode = trie.prefixSearch(input[from]); // search for first letter

    let k = from - 1;
    let result = k;

    while (node && k >= 0)
    {
        if (node.isEndOfWord())
            result = k;
        const nextLetter = input[k];
        node = node.getChild(nextLetter);
        k -= 1;
    }

    return result;
}

// Should this go left to right or right to left? Different outcomes. For now, backwards
const inputWordSplit= (input:string, trie:Trie):Array<number> =>
{
    let k = input.length - 1;
    let result:Array<number>= [k];

    while (k > 0)
    {
        const l:number = bwNextWordOrLetterBoundary(k, input, trie);
        result.push(l);
        k = l;
    }

    return (result);
}

//const testWords:Array<string> = ["foo", "bar", "ire", "baz", "house", "fun", "squirrel", "in", "inn"];
const testWords:Array<string> = ["foo", "bar", "baz", "house", "fun", "squire", "in", "inn"];
const testInput:string = "fobarfooinnhousesquirebabazin";

// init backwards trie
const backwardsWords:Array<string> = testWords.map( (word:string) => sreverse(word) );
const backwardsTrie = new Trie();
for (const word of backwardsWords)
    backwardsTrie.insert(word);

const r:Array<number> = inputWordSplit(testInput, backwardsTrie);
console.log(testInput);
console.log(testWords);
let l = testInput.length;
for (const k of r) {
    console.log(testInput.slice(k+1, l))
    l = k+1;
}
console.log(testInput.slice(0, l));