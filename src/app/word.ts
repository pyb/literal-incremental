import {Trie} from "./trie/trie";
import { GameData } from "./GameData";

const isPartialWord = (partialWord: string, tdict: Trie) => {
  const node = tdict.prefixSearch(partialWord);
  if (node === null)
    return false;

  return true;
}

// Is it a word ; and am I unable to extend it.
const isWordTerminal = (word: string, tdict: Trie, maxLength?: number): boolean => {
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

// Return value of nextWordState. 
export interface WordState {
  currentPartialWord?: string,
  finishedWord?: string,
}

// TODO : implement maxWordLength properly.
// Compute next state.
export const nextWordState = (letter: string, currentPartialWord: string, maxWordLength?: number):WordState => {
  if (maxWordLength == 0)
    return ({});

  const tentativeWord = currentPartialWord.concat(letter);

  const tdict:Trie = GameData.tdict;

  if (isPartialWord(tentativeWord, tdict)) {
    if (isWordTerminal(tentativeWord, tdict, maxWordLength))
      return {
        finishedWord: tentativeWord
      }
    else
      return {
        currentPartialWord: tentativeWord
      }
  }
  else if (tdict.has(currentPartialWord))  // Is this always true?
    return {
      finishedWord: currentPartialWord,
      currentPartialWord: isPartialWord(letter, tdict) ? letter : ""
    }
  else
    return {};
    // Normally unreachable?
    //throw new Error("Error : " + currentPartialWord + " should be in dict");
}
