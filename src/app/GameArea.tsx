'use client'

// 'etaoin schrldu'

import styles from "./page.module.css"
import React, { useState, useRef, useEffect, useCallback } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import Keyboard, { KeyStatus, KeyMode } from "./Keyboard";
import { Trie } from "./trie/trie";
import { TrieNode } from "./trie/trieNode";
import { KeyInfo, GameData } from "./gamedata";

const tdict = Trie.fromArray(GameData.dict);

const ScoreBoard = ({ glyphs, words }: { glyphs: number, words: number }) => {
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
    (kInfo: KeyInfo): KeyStatus => ({
      letter: kInfo.key,
      mode: (boughtKeys.includes(kInfo.key) ? KeyMode.BOUGHT : KeyMode.VISIBLE)
    })
  );
};

// Adding a temporary basic InputArea to enable the implementation of word typing.
const InputArea = ({ input }: { input: string }) => {
  return (
    <>
      <span>{input}</span>
    </>
  )
}

const Shop = ({ isB1Visible, isB1Active, B1callback, isB2Visible, isB2Active, B2callback }:
  { isB1Visible: boolean, isB1Active: boolean, B1callback: () => void, isB2Visible: boolean, isB2Active: boolean, B2callback: () => void} ) =>
  {
  return (
    <>
      <ul>
        {
          isB1Visible &&
          <li>
            <button
              className={isB1Active ? styles.boosterActive : styles.boosterInactive}
              onClick={B1callback}
              id="booster1">
              Booster1
            </button>
          </li>
        }
        {
        isB2Visible && 
        <li>
          <button
              className={isB2Active ? styles.boosterActive : styles.boosterInactive}
              onClick={B2callback}
              id="booster2">
              Booster2
          </button>
        </li>
        }
      </ul >
    </>
  );
}
const WordTest = ({ currentPartialWord, lastWord }: { currentPartialWord: string, lastWord: string }) => {
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
}

const isWordTerminal = (word: string, tdict: Trie, maxLength: number): boolean => {
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
const nextWordState = (key: string, currentPartialWord: string, tdict: Trie, maxWordLength: number) => {
  let finishedWord = "";
  const tentativeWord = currentPartialWord.concat(key);

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

  const pressedKeys = useRef<Set<string>>(new Set<string>());
  const intervalId = useRef<number>(0);
  //  const lastTimeUpdate = useRef<number>(Date.now());

  // tmp
  const [currentPartialWord, setCurrentPartialWord] = useState<string>("");
  const [lastScoredWord, setLastScoredWord] = useState<string>("");

  const [isB1Visible, setB1Visible] = React.useState<boolean>(false);
  const [isB1Active, setB1Active] = React.useState<boolean>(false);
  const [isB2Visible, setB2Visible] = React.useState<boolean>(false);
  const [isB2Active, setB2Active] = React.useState<boolean>(false);

  const processGlyph = (key: string) => {
    // Update InputArea
    let buffer = inputBuffer;
    if (buffer.length == GameData.inputSize) {
      buffer = buffer.slice(GameData.inputSize / 2, GameData.inputSize);
    }
    setInputBuffer(buffer + key);

    const nextState = nextWordState(key, currentPartialWord, tdict, GameData.maxWordLength);
    setCurrentPartialWord(nextState.currentPartialWord);
    if (nextState.finishedWord != "") {
      setLastScoredWord(nextState.finishedWord);
      setWords(words + 1);
    }
    setGlyphs(glyphs + 1);
    if (!isB1Visible &&
      (glyphs + 1) >= GameData.B1VisPrice) {
      setB1Visible(true);
    }
    if (!isB2Visible &&
      (glyphs + 1) >= GameData.B2VisPrice) {
      setB2Visible(true);
    }
  }

  const B1callback = () =>
  {
    setB1Active(true);
  }

  const B2callback = () =>
  {
    setB2Active(true);
  }

  const stopKeyHighlight = () => {
    setKeyHighlight(false);
  }

  const handleKey = (key: string) => {
    if (boughtKeys.includes(key)) {
      // Highlight key in Keyboard
      setLastPressed(key);
      setKeyHighlight(true);
      window.setTimeout(
        stopKeyHighlight,
        GameData.highlightDuration);

      processGlyph(key);
    }
  }

  const handleKeydown = (kev: KeyboardEvent) => {
    let key: string = kev.key.toLowerCase();
    if (key.length == 1 &&
      key >= 'a' && key <= 'z') {
      if (!pressedKeys.current.has(key)) {
        pressedKeys.current.add(key);
        handleKey(key);
      }
    }
  }

  const handleKeyup = (kev: KeyboardEvent) => {
    let key: string = kev.key.toLowerCase();
    if (key.length == 1 &&
      key >= 'a' && key <= 'z') {
      pressedKeys.current.delete(key);
    }
  }

  const processTimeouts = () => {
    /*
    // Fine timeout control not need (yet?)
     const now = Date.now();
     const elapsed = now - lastTimeUpdate.current;
     lastTimeUpdate.current = now;
     */
    pressedKeys.current.forEach(
      (key: string) =>
        handleKey(key));
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('keyup', handleKeyup);
    intervalId.current = window.setInterval(processTimeouts, GameData.tick);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('keyup', handleKeyup);
      window.clearInterval(intervalId.current);
      intervalId.current = 0;
    };
  }, [glyphs]);

  return (
    <>
      <ScoreBoard glyphs={glyphs} words={words} />
      <Shop isB1Visible={isB1Visible} isB1Active={isB1Active} B1callback={B1callback}
            isB2Visible={isB2Visible} isB2Active={isB2Active} B2callback={B2callback}></Shop>
      <Keyboard allKeyStatus={getKeyStatus(GameData.keyInfo, boughtKeys, glyphs)}
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
