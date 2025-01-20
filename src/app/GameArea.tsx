'use client'

// 'etaoin schrldu'

import styles from "./page.module.css"
import React, { useState, useEffect, useCallback } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react"
import Keyboard, { KeyStatus, KeyMode } from "./Keyboard"
import { Trie } from "./trie/trie"
import { TrieNode } from "./trie/trieNode"

const highlightDuration = 150;

const maxWordLength = 4;
const inputSize = 20;
const adict = ['i', 'sin', 'is', 'in', 'si'];
const tdict = Trie.fromArray(adict);

interface KeyInfo {
  key: string,
  visibilityPrice: number,
  price: number,
  repeaterPrice: number
}

const keyInfo = [
  { key: 'i', visibilityPrice: 0, price: 0, repeaterPrice: 500 },
  { key: 's', visibilityPrice: 1, price: 100, repeaterPrice: 5000 },
  { key: 'n', visibilityPrice: 1, price: 200, repeaterPrice: 50000 },
  { key: 'c', visibilityPrice: 200, price: 300, repeaterPrice: 500000 },
  { key: 'h', visibilityPrice: 350, price: 500, repeaterPrice: 5000000 },
  { key: 'o', visibilityPrice: 600, price: 750, repeaterPrice: 50000000 },
  { key: 'r', visibilityPrice: 800, price: 1000, repeaterPrice: 500000000 },
];

const ScoreBoard = ({glyphs, words} : {glyphs: number, words: number}) =>
{
  return (
  <>
    <div>Glyphs : {glyphs}</div>
    <div>Words : {words}</div>
  </>
  );
};

const getKeyStatus = (keyInfo: Array<KeyInfo>, boughtKeys: Array<string>, score: number): KeyStatus[] => {
  const visibleKeys = keyInfo.filter((key) => (score >= key.visibilityPrice));
  return visibleKeys.map(
    (kInfo: KeyInfo) :KeyStatus => ({
      letter: kInfo.key,
      mode: (boughtKeys.includes(kInfo.key) ? KeyMode.BOUGHT : KeyMode.VISIBLE)
  })
  );
};

// Adding a temporary basic InputArea to enable the implementation of word typing.
const InputArea = ({input}: {input: string}) =>
{
  return (
    <>
      <span>{input}</span>
    </>
  )
}

const WordTest = ({currentPartialWord, lastWord}:{currentPartialWord:string, lastWord:string}) =>
{
  return (
  <>
    <span> {"Ongoing : " + currentPartialWord + "  Last : " + lastWord} </span>
  </>)
}

const isPartialWord = (partialWord: string, tdict: Trie) => {
  const node = tdict.prefixSearch(partialWord);
  if (node === null)
    return false;
  
  return true;
  /*
  // Old naive dictionary implementation / no trie 
  for (let word of dict) {
    const len = partialWord.length;
    const w = word.slice(0, len);
    if (partialWord == w)
      return true;
  }
  return false;
  */
}

const isWordTerminal = (word: string, tdict: Trie, maxLength: number):boolean =>
{
  const node = tdict.prefixSearch(word);
  if (!node)
    return false;
  else if (word.length == maxLength)
    return true;
  else if (node.childrenCount() > 0)
    return false;
  
  return true;
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

// Complete next state.  
const nextWordState = (key:string, currentPartialWord:string, tdict:Trie, maxWordLength: number) =>
{
  let finishedWord = "";
  const tentativeWord = currentPartialWord.concat(key);

  if (isPartialWord(tentativeWord, tdict))
  {
    if (isWordTerminal(tentativeWord, tdict, maxWordLength))
    {
      finishedWord = tentativeWord;
      currentPartialWord = "";
    }
    else
      currentPartialWord = tentativeWord;
  }
  else if (tdict.has(currentPartialWord))
  {
    finishedWord = currentPartialWord;
    currentPartialWord = isPartialWord(key, tdict) ? key : "";
  }

  return (
  {
    currentPartialWord: currentPartialWord,
    finishedWord: finishedWord
  });
}

const GameArea = () => {
  const [glyphs, setGlyphs] = useState<number>(0);
  const [words, setWords] = useState<number>(0);
  const [lastPressed, setLastPressed] = useState<string>("");
  const [keyHighlight, setKeyHighlight] = useState<boolean>(false);
  const [boughtKeys, setBoughtKeys] = useState<Array<string>>(['i', 's', 'n']);
  const [inputBuffer, setInputBuffer] = useState<string>("");
  
  // tmp
  const [currentPartialWord, setCurrentPartialWord] = useState<string>("");
  const [lastScoredWord, setLastScoredWord] = useState<string>("lcw");

  const stopKeyHighlight = () => {
    setKeyHighlight(false);
  }

  const addKeyToBuffer = (key:string):void =>
  {
    let buffer = inputBuffer;
    if (buffer.length == inputSize) {
      buffer = buffer.slice(inputSize / 2, inputSize);
    }
    setInputBuffer(buffer + key);
  }

  const processKey = (key:string) =>
  {
    setGlyphs(glyphs + 1);
    addKeyToBuffer(key);
    const nextState = nextWordState(key, currentPartialWord, tdict, maxWordLength);
    setCurrentPartialWord(nextState.currentPartialWord);
    if (nextState.finishedWord != "")
    {
      setLastScoredWord(nextState.finishedWord);
      setWords(words + 1);
    }
  }

  const handleKeydown = (kev: KeyboardEvent) => {
    let key:string = kev.key.toLowerCase();
    if ( key.length == 1 &&
         key >= 'a' && key <= 'z' &&
         boughtKeys.includes(key) )
    {
      setLastPressed(key);
      setKeyHighlight(true);
      window.setTimeout(
        stopKeyHighlight,
        highlightDuration);
      
      processKey(key);
    }
  }

  const handleKeyup = (kev: KeyboardEvent) => {
    //let key:string = kev.key;
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('keyup', handleKeyup);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('keyup', handleKeyup);
    };
  }, [glyphs]);

  return (
    <>
      <ScoreBoard glyphs={glyphs} words={words}/>
      <Keyboard allKeyStatus={getKeyStatus(keyInfo, boughtKeys, glyphs)}
                focusedKey={keyHighlight ? lastPressed : ""} />
      <InputArea input={inputBuffer} />
      <WordTest currentPartialWord={currentPartialWord} lastWord={lastScoredWord} />
    </>
  );
};

/*
const TestArea = () => {
  const count = useMotionValue(0);
  const opacity = useTransform (() => count.get()/100);
  useEffect(() => {
    const controls = animate(count, 100, { duration: 0.2 })
    return () => controls.stop()
  }, [])

  return (
    <motion.div className={styles.teststyle} whileHover={{ scale: 1.1 }} style={{opacity}}>
    Foo
    </motion.div>
  )
}
*/

export default GameArea;
