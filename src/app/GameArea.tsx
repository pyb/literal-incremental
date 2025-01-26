'use client'

// 'etaoin schrldu'

import styles from "./page.module.css"
import React, { useState, useRef, useEffect} from "react";
/*
import { animate, motion, useMotionValue, useTransform } from "motion/react";
*/
import Keyboard, { KeyStatus, KeyMode } from "./Keyboard";
import ScoreBoard from "./ScoreBoard";

import { Trie } from "./trie/trie";
/*
import { TrieNode } from "./trie/trieNode";
*/
import { KeyInfo, GameData, ShopEntry, ShopAction } from "./gamedata";
import Log from "./Log";
import Shop from "./Shop";

const tdict = Trie.fromArray(GameData.tinydict);

const getKeyMode = (key:string, boughtKeys: Set<string>, repeatableKeys: Set<string>,
   repeatAvailable: boolean, unlockAvailable: boolean, repeatSelectMode: boolean) =>
{
  if (repeatSelectMode && repeatableKeys.has(key))
    return KeyMode.REPEAT_TOGGLE;
  if (repeatAvailable && !repeatableKeys.has(key) && boughtKeys.has(key))
    return KeyMode.REPEAT_PURCHASEABLE;
  else if (boughtKeys.has(key))
    return KeyMode.BOUGHT
  else if (unlockAvailable)
    return KeyMode.PURCHASEABLE;
  else
    return KeyMode.VISIBLE;
}

const getKeyStatus = (keyInfo: Array<KeyInfo>,
                      boughtKeys: Set<string>, repeatableKeys: Set<string>, repeatSelectMode: boolean,
                      repeatAvailable: boolean, unlockAvailable: boolean, score: number): KeyStatus[] => {
  const visibleKeys = keyInfo.filter((key) => (score >= key.visibilityPrice));
  return visibleKeys.map(
    (kInfo: KeyInfo): KeyStatus => ({
      letter: kInfo.key,
      mode: getKeyMode(kInfo.key, boughtKeys, repeatableKeys, repeatAvailable, unlockAvailable, repeatSelectMode)
    })
  );
};

// Adding a temporary basic InputArea to enable the implementation of word typing.
const InputArea = ({ input }: { input: string }) => {
  return (
    <div className={styles.inputArea}>
      <span>{input}</span>
    </div>
  )
}

// Temporary area to see the current and last words
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
const nextWordState = (key: string, currentPartialWord: string, tdict: Trie, maxWordLength: number) => {
  if (maxWordLength == 0)
  {
    return (
      {
        currentPartialWord: "",
        finishedWord: ""
      });
  }

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
const keyScores: Record<string, number>= {};
for (const keyInfo of GameData.keyInfo)
{
  keyScores[keyInfo.key] = keyInfo.score;
}

const GameArea = () => {
  const [score, setScore] = useState<number>(0);
  const [glyphs, setGlyphs] = useState<number>(0);
  const [words, setWords] = useState<number>(0);
  const [lastPressed, setLastPressed] = useState<string>("");
  const [keyHighlight, setKeyHighlight] = useState<boolean>(false);
  const [boughtKeys, setBoughtKeys] = useState<Set<string>>(new Set<string>(['i']));
  const [repeatableKeys, setRepeatableKeys] = useState<Set<string>>(new Set<string>());
  const [inputBuffer, setInputBuffer] = useState<string>("");
  const [inputVisible, setInputVisible] = useState<boolean>(false);
  const [repeatKeys, setRepeatKeys] = useState<Set<string>>(new Set<string>());

  const [maxWordSize, setMaxWordSize] = useState<number>(0);
  const [log, setLog] = useState<Array<string>>(["", "", "", "",
    GameData.welcomeMessage]);
  const pressedKeys = useRef<Set<string>>(new Set<string>());
  const intervalId = useRef<number>(0);

  const [activeShopItems, setActiveShopItems] = useState<Set<number>>(new Set<number>());
  const [visibleShopItems, setVisibleShopItems] = useState<Set<number>>(new Set<number>());
  const [unlockAvailable, setUnlockAvailable] = useState<boolean>(false);
  const [repeatAvailable, setRepeatAvailable] = useState<boolean>(false);

  const [currentPartialWord, setCurrentPartialWord] = useState<string>("");
  const [lastScoredWord, setLastScoredWord] = useState<string>("");

  //  const lastTimeUpdate = useRef<number>(Date.now());  
  const [doProcessTimeouts, setDoProcessTimeouts] = useState<boolean>(false);

  //tmp
  const [isB1Active, setB1Active] = useState<boolean>(false);
  const [isB2Active, setB2Active] = useState<boolean>(false);

  //const [autoRepeat, setAutorepeat] = useState<Set<([key: string]: number)>>();
  const [repeatSelectMode, setRepeatSelectMode] = useState<boolean>(false);

  const processTimeouts = () => {
    // TODO : implement key repetition rate
    /*
    // Fine timeout control not need (yet?)
     const now = Date.now();
     const elapsed = now - lastTimeUpdate.current;
     lastTimeUpdate.current = now;
    */
    repeatKeys.forEach(
      (key: string) =>
        handleKey(key));

    pressedKeys.current.forEach(
      (key: string) =>
        handleKey(key));
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('keyup', handleKeyup);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('keyup', handleKeyup);
    };
  });

  useEffect(() => {;
   // intervalId.current = window.setInterval(processTimeouts, GameData.tick);
    intervalId.current = window.setInterval(() => setDoProcessTimeouts(true),
                                            GameData.tick);
    return () => {
      window.clearInterval(intervalId.current);
    };
  }, []);

  const addLog = (message: string) =>
  {
    const newLog = log.slice(1, log.length);
    newLog.push(message);
    setLog(newLog);
  }

  const processGlyph = (key: string) => {
    let buffer = inputBuffer;
    if (buffer.length == GameData.inputSize) {
      buffer = buffer.slice(GameData.inputSize / 2, GameData.inputSize);
    }
    setInputBuffer(buffer + key);

    const nextState = nextWordState(key, currentPartialWord, tdict, maxWordSize);
    setCurrentPartialWord(nextState.currentPartialWord);
    if (nextState.finishedWord != "") {
      setLastScoredWord(nextState.finishedWord);
      setWords((word) => word + 1);
    }
    setGlyphs((glyph) => glyph + 1);
    setScore((score) => score + keyScores[key]);

    for (const entry of GameData.shopEntries) {
      if ((glyphs + 1) >= entry.visibilityPrice)
        setVisibleShopItems((s) => s.add(entry.index));
    }
  }

  const handleKey = (key: string) => {
    if (boughtKeys.has(key)) {
      // Highlight key in Keyboard
      setLastPressed(key);
      setKeyHighlight(true);
      window.setTimeout(
        () => setKeyHighlight(false),
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

  const keyboardClick = (key: string) => {
    if (repeatSelectMode && repeatableKeys.has(key))
    {
      if (repeatKeys.has(key))
      {
        repeatKeys.delete(key)
        setRepeatKeys(repeatKeys);
        console.log("removed repeat key " + key);
      }
      else {
        setRepeatKeys(repeatKeys.add(key));
        console.log("adding repeat key " + key);
      }
    }
    else if (unlockAvailable && !boughtKeys.has(key))
    {
      setUnlockAvailable(false);
      setBoughtKeys(boughtKeys.add(key));
    }
    else if (repeatAvailable && !repeatableKeys.has(key))
    {
      setRepeatAvailable(false);
      setRepeatableKeys(repeatableKeys.add(key));
    }
  }

  const shopClick = (action: ShopAction, n: number, index: number, shopEntries: Array<ShopEntry>) => {
    const entry: ShopEntry = shopEntries[index];
    const price = entry.price;

    if (!activeShopItems.has(index) &&
      (glyphs >= price)) {
      setGlyphs(glyphs - price);
      setActiveShopItems(activeShopItems.add(index));
      addLog("Bought : " + entry.text + " for " + price);
      // TODO : Insert side effects here
      switch (action) {
        case ShopAction.LETTERUNLOCK:
          setUnlockAvailable(true);
          break;
        case ShopAction.WORDUNLOCK:
          setInputVisible(true);
          console.assert(n == (maxWordSize + 1), n, maxWordSize);
          setMaxWordSize(n); // should always be maxWordSize+1
          break;
        case ShopAction.REPEATUNLOCK:
          setRepeatAvailable(true)
          break;
        default:
      }
    }
  }

  const repeatModeClick = () => {
    setRepeatSelectMode (!repeatSelectMode);
  }

  if (doProcessTimeouts)
  {
    setDoProcessTimeouts(false);
    processTimeouts();
  }
    
  return (
    <>
      <Log log={log}></Log>
      <ScoreBoard score={score} glyphs={glyphs} words={words} maxWordSize={maxWordSize}/>
      <WordTest currentPartialWord={currentPartialWord} lastWord={lastScoredWord} />
      <Shop score={score}
            shopItems={GameData.shopEntries}
            visibleShopItems={visibleShopItems}
            activeShopItems={activeShopItems}
            callback={shopClick}></Shop>
      <Keyboard allKeyStatus={getKeyStatus(GameData.keyInfo, boughtKeys, repeatableKeys, repeatSelectMode, repeatAvailable, unlockAvailable, score)}
                clickCallback={keyboardClick}
                repeatModeCallback={repeatModeClick}
                repeatVisible={true}
                focusedKey={keyHighlight ? lastPressed : ""} />
      {inputVisible &&
      <InputArea input={inputBuffer} />}
    </>
  );
};

export default GameArea;
