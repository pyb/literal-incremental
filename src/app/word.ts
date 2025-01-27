import { Trie } from "./trie/trie";
/*
import { TrieNode } from "./trie/trieNode";
*/
import { GameData } from "./GameData";

const tdict = Trie.fromArray(GameData.tinydict);

const isPartialWord = (partialWord: string, tdict: Trie) => {
  const node = tdict.prefixSearch(partialWord);
  if (node === null)
    return false;

  return true;
}

// Is it a word, and am I unable to extend it?
const isWordTerminal = (word: string, tdict: Trie, maxLength: number): boolean => {
  if (!tdict.find(word))
    return false;
  const node = tdict.prefixSearch(word);
  if ((word.length == maxLength) ||
      (node.childrenCount() == 0) )
    return true;

  return false;
}

/* 
  Design : word formation.

  Currently, typed letters can do the following (possibly overlapping) things:
  -Start a new word
  -No-op, ie not start a new word, or add to an existing word
  -Interrupt an incomplete word, and either start a new one, or No-op
  -Continue ongoing word
  -Complete a word
  

  Q : Is state transition completely determined by an op (key, currentWord) -> (currentWord, lastWord) ?
*/

//TODO : implement maxWordLength properly.
// Complete next state.  
export const nextWordState = (letter: string, currentPartialWord: string, maxWordLength: number) => {
  if (maxWordLength == 0)
  {
    return (
      {
        currentPartialWord: "",
        finishedWord: ""
      });
  }

  let finishedWord = "";
  const tentativeWord = currentPartialWord.concat(letter);

  if (isPartialWord(tentativeWord, tdict)) {
    if (isWordTerminal(tentativeWord, tdict, maxWordLength)) {
      finishedWord = tentativeWord;
      currentPartialWord = "";
    }
    else
      currentPartialWord = tentativeWord;
  }
  else if (tdict.has(currentPartialWord)) {
    finishedWord = currentPartialWord;
    currentPartialWord = isPartialWord(letter, tdict) ? letter : "";
  }
  // TODO : re-check if else statement needed

  return (
    {
      currentPartialWord: currentPartialWord,
      finishedWord: finishedWord
    });
}
