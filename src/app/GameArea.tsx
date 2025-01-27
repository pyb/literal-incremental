'use client'

// 'etaoin schrldu'

import styles from "./page.module.css"
import React, { useState, useRef, useEffect} from "react";
import { enableMapSet} from "immer";
enableMapSet();
import { useImmer } from "use-immer";
/*
import { animate, motion, useMotionValue, useTransform } from "motion/react";
*/

import { KeyInfo, GameData, UIData, ShopEntry, ShopAction } from "./GameData";
import { GameState, initialGameState } from "./GameState";

import Keyboard, { KeyStatus, KeyMode } from "./Keyboard";
import ScoreBoard from "./ScoreBoard";
import DictArea from "./DictArea";
import InputArea from "./InputArea";
import Log from "./Log";
import Shop from "./Shop";

import { Trie } from "./trie/trie";
/*
import { TrieNode } from "./trie/trieNode";
*/

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

const GameArea = () => {
  const [GS, setGS] = useImmer<GameState>(initialGameState);

  // Utility function
  const addLog = (message: string) => {
    setGS(gs => {
      gs.log.splice(0, 1) // remove first
      gs.log.push(message)
    });
  }

  /**************************************************************/

  // UI state, game timer state

  //  const lastTimeUpdate = useRef<number>(Date.now());  
  const [doProcessTimeouts, setDoProcessTimeouts] = useState<boolean>(false);

  const intervalId = useRef<number>(0);
  const pressedKeys = useRef<Set<string>>(new Set<string>());

  const processTimeouts = () => {
    // TODO : implement key repetition rate
    /*
    // Fine timeout control not need (yet?)
     const now = Date.now();
     const elapsed = now - lastTimeUpdate.current;
     lastTimeUpdate.current = now;
    */
    GS.repeatKeys.forEach(handleKey);
    pressedKeys.current.forEach(handleKey);
  }

  const handleKeydown = (kev: KeyboardEvent) => {
    let key: string = kev.key.toLowerCase();
    if (key.length == 1 &&
      key >= 'a' && key <= 'z') {
      if (!pressedKeys.current.has(key)) {
        pressedKeys.current.add(key);
        handleKey(key); // maybe try removing this later (it will add latency but will integrate better with processTimeouts)
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
                                            UIData.tick);
    return () => {
      window.clearInterval(intervalId.current);
    };
  }, []);

  /**************************************************************************/
  // Keypress handling, scoring, word formation

  const processGlyph = (key: string) => {
    let buffer = GS.inputBuffer;
    if (buffer.length == GameData.inputSize) {
      buffer = buffer.slice(GameData.inputSize / 2, GameData.inputSize);
    }
    setGS(gs => {gs.inputBuffer = buffer + key});

    const nextState = nextWordState(key, GS.currentPartialWord, tdict, GS.maxWordSize);
    setGS(gs => {gs.currentPartialWord = nextState.currentPartialWord});
    if (nextState.finishedWord != "") {
      setGS(gs => {gs.lastScoredWord = nextState.finishedWord});
      setGS(gs => {gs.words++});
    }
    setGS(gs => {gs.glyphs++});
    setGS(gs => {gs.score += GameData.keyScores[key]});

    for (const entry of GameData.shopEntries) {
      if ((GS.glyphs + 1) >= entry.visibilityPrice)
        setGS(gs => {gs.visibleShopItems.add(entry.index)});
    }
  }

  const handleKey = (key: string) => {
    if (GS.boughtKeys.has(key)) {
      setGS(gs => {gs.lastPressed = key});
      processGlyph(key);
    }
  }

  const keyboardClick = (key: string) => {
    if (GS.repeatSelectMode && GS.repeatableKeys.has(key)) {
      setGS(gs => {gs.repeatKeys.has(key)?
                      gs.repeatKeys.delete(key) :
                      gs.repeatKeys.add(key)});
    }
    else if (GS.unlockAvailable && !GS.boughtKeys.has(key)) {
      setGS(gs => {gs.unlockAvailable = false;
                   gs.boughtKeys.add(key);});
    }
    else if (GS.repeatAvailable && !GS.repeatableKeys.has(key)) {
      setGS(gs => {gs.repeatAvailable = false;
                   gs.repeatableKeys.add(key);});
    }
  }
  
  /**************************************************************************/

  // Temporary area to see the current and last words
  const WordTest = ({ currentPartialWord, lastWord }: { currentPartialWord: string, lastWord: string }) => {
    return (
      <>
        <span> {"Ongoing : " + currentPartialWord + "  Last : " + lastWord} </span>
      </>)
  }

  /**************************************************************************/
  // Shop

  const shopClick = (action: ShopAction, n: number, index: number, shopEntries: Array<ShopEntry>) => {
    const entry: ShopEntry = shopEntries[index];
    const price = entry.price;

    if (!GS.activeShopItems.has(index) && (GS.glyphs >= price)) {
      setGS(gs => {gs.glyphs -= price;
                   gs.activeShopItems.add(index)});
      addLog("Bought : " + entry.text + " for " + price);
      // TODO : Insert side effects here
      switch (action) {
        case ShopAction.LETTERUNLOCK:
          setGS(gs => {gs.unlockAvailable = true});
          break;
        case ShopAction.WORDUNLOCK:
          console.assert(n == (GS.maxWordSize + 1), n, GS.maxWordSize);
          setGS(gs => {gs.inputVisible = true;
                       gs.maxWordSize = n}); // should always be maxWordSize+1
          break;
        case ShopAction.REPEATUNLOCK:
          setGS(gs => {gs.repeatAvailable = true});
          break;
        default:
      }
    }
  }

  const repeatModeClick = () => {
    setGS(gs => {gs.repeatSelectMode = !gs.repeatSelectMode});
  }

  if (doProcessTimeouts)
  {
    setDoProcessTimeouts(false);
    processTimeouts();
  }
  
  return (
    <>
      <Log log={GS.log}></Log>
      <ScoreBoard score={GS.score} glyphs={GS.glyphs} words={GS.words} maxWordSize={GS.maxWordSize}/>
      <DictArea />
      <WordTest currentPartialWord={GS.currentPartialWord} lastWord={GS.lastScoredWord} />
      <Shop score={GS.score}
            shopItems={GameData.shopEntries}
            visibleShopItems={GS.visibleShopItems}
            activeShopItems={GS.activeShopItems}
            callback={shopClick}></Shop>
      <Keyboard allKeyStatus={getKeyStatus(GameData.keyInfo, GS.boughtKeys, GS.repeatableKeys,
                                           GS.repeatSelectMode, GS.repeatAvailable, GS.unlockAvailable, GS.score)}
                clickCallback={keyboardClick}
                repeatModeCallback={repeatModeClick}
                repeatVisible={true}
                focusedKey={GS.lastPressed}
                pressed={!(pressedKeys.current.size == 0)}/>
      {GS.inputVisible &&
      <InputArea input={GS.inputBuffer} />}
    </>
  );
};

export default GameArea;
