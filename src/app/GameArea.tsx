'use client'

// 'etaoin schrldu'

import styles from "./css/game.module.css";
import RCstyles from "./css/rcscout.module.css";

import React, { useState, useRef, useEffect, Children } from "react";
import { enableMapSet } from "immer";
enableMapSet(); // immer setup call, to make Maps and Sets work
import { useImmer } from "use-immer";
/*
import { animate, motion, useMotionValue, useTransform } from "motion/react";
*/

import { KeyInfo, GameData, UIData } from "./GameData";
import { emptyInputItem, GameState, initialGameState} from "./GameState";
import { nextWordState, WordState } from "./word";
import { load, save } from "./persist";

import Keyboard, { KeyStatus } from "./Keyboard";
import DictArea from "./Dict";
import {InputItem, LogItem, KeyMode, DictItem} from "./GameTypes"

import InputArea from "./InputArea";
import Log from "./Log";

import * as fs from "./fakeState";
import next from "next";

/**************************************************************/

const getKeyMode = (key: string, glyphs: number, visibilityThreshold:number, availableKeys: Set<string>, repeatableKeys: Set<string>,
  repeatAvailable: boolean, repeatSelectMode: boolean) =>
{
  if (repeatSelectMode && repeatableKeys.has(key))
    return KeyMode.REPEAT_TOGGLE;
  if (repeatAvailable && !repeatableKeys.has(key) && availableKeys.has(key))
    return KeyMode.REPEAT_PURCHASEABLE;
  else if (availableKeys.has(key))
    return KeyMode.UNLOCKED
  /* // guess it'll no longer work like this 
  else if (unlockAvailable)
    return KeyMode.PURCHASEABLE;
  */
  else if (glyphs >= visibilityThreshold)
    return KeyMode.VISIBLE;
  else
    return KeyMode.INVISIBLE;
}

// TODO : move to Keyboard.tsx?
const getKeyStatus = (keyInfo: Array<KeyInfo>, glyphs: number,
  availableKeys: Set<string>, repeatableKeys: Set<string>, repeatSelectMode: boolean,
  repeatAvailable: boolean): KeyStatus[] => 
{
  return keyInfo.map(
    (kInfo: KeyInfo): KeyStatus => ({
      key: kInfo.key,
      mode: getKeyMode(kInfo.key, glyphs, kInfo.visibilityThreshold, availableKeys, repeatableKeys, repeatAvailable, repeatSelectMode)
    }));
};

/***************************************************************************************** */
// Various components

const RCScout = () => {
  return (
    <div className={styles.scout}>
      <div className={RCstyles.rcScout} data-scout-rendered={true}>
        <p className={RCstyles.rcScout__text}>
          <i className={RCstyles.rcScout__logo}></i>
          Want to become a better programmer?
          <a className={RCstyles.rcScout__link} href="https://www.recurse.com/scout/click?t=af9a73dda60f0a29147b1aaddbc4a088">
            Join the Recurse Center!</a>
        </p>
      </div>
    </div>);
  }

const Debug = ({GS}: {GS: GameState}) => {
  return (
    <>
      <p> Glyphs : {GS.glyphs}</p>
    </>
  );
}

interface FooterProps {
  items: Array<React.ReactNode>;
};

const MultiFooter = ({ items }: FooterProps) => {
  const [idx, setIdx] = useState<number>(0);

  const rotate = () => {
    const n = items.length;
    setIdx(((idx + 1) % n));
  };

  return (
    <div className={styles.multifooter}>
      <div className={styles.footerContent}>{items[idx]}</div>
      <button className={styles.footerButton} onClick={rotate}> More... </button>
    </div>);
};

// Temporary area to see the current and last words
const WordTest = ({ currentPartialWord, lastWord }: { currentPartialWord: string, lastWord: string }) => {

  useEffect(() => {
    console.log("wt created");
  }, []);

  return (
    <>
      <span> {"Ongoing : " + currentPartialWord + "  Last : " + lastWord} </span>
    </>)
}

/**************************************************************/

const GameArea = () => {
  const [GS, setGS] = useImmer<GameState>(initialGameState);

  // Utility function
  const addLog = (message: string) => {
    setGS(gs => {
      gs.log.splice(0, 1) // remove first
      const logItem:LogItem = {
        text: message,
        key:GS.logKey
      }
      gs.logKey += 1;
      gs.log.push(logItem);
    });
  }

  const reset = () => {
    setGS(initialGameState);
  }

  /**************************************************************/

  // UI state, game timer state

  //  const lastTimeUpdate = useRef<number>(Date.now());  
  const [doProcessTimeouts, setDoProcessTimeouts] = useState<boolean>(false);

  const intervalId = useRef<number>(0);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set<string>());

  const processTimeouts = () => {
    // TODO : implement key repetition rate
    /*
    // Fine timeout control not need (yet?)
     const now = Date.now();
     const elapsed = now - lastTimeUpdate.current;
     lastTimeUpdate.current = now;
    */
    GS.repeatKeys.forEach(handleKey);
    pressedKeys.forEach(handleKey);
    save(GS);
  }

  const handleKeydown = (kev: KeyboardEvent) => {
    let key: string = kev.key.toLowerCase();
    if (key.length == 1 &&
      key >= 'a' && key <= 'z') {
      if (!pressedKeys.has(key)) {
        setPressedKeys(new Set<string>(pressedKeys.add(key)));
        handleKey(key); // maybe try removing this later (it will add latency but will integrate better with processTimeouts)
      }
    }
  }

  const handleKeyup = (kev: KeyboardEvent) => {
    let key: string = kev.key.toLowerCase();
    if (key.length == 1 &&
      key >= 'a' && key <= 'z') {
      pressedKeys.delete(key);
      setPressedKeys(new Set<string>(pressedKeys));
    }
  }

  useEffect(() => {
    //   console.log(pressedKeys)
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('keyup', handleKeyup);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('keyup', handleKeyup);
    };
  });

  useEffect(() => {
    ;
    setGS(load());
    // intervalId.current = window.setInterval(processTimeouts, GameData.tick);
    intervalId.current = window.setInterval(() => setDoProcessTimeouts(true),
      UIData.tick);
    return () => {
      window.clearInterval(intervalId.current);
    };
  }, []);

  /**************************************************************************/
  // Keypress handling, scoring, word formation

  type LetterInput = {
    letter: string,
    rep?: number
  }

  type WordInput = {
    word: string,
    rep?: number
  }
  type Input = {
    foo : LetterInput | WordInput;
  }
  
  let inputKey = 10;
  const nextInputKey = () => {
    return inputKey++;
  }

  const handleKey = (key: string):void => {
    if (GS.availableKeys.has(key)) {
      let input:InputItem = structuredClone(GS.currentInput);
      const currentPartialWord = input.letter || input.word || input.prefix || '';
      
      const nextState:WordState = nextWordState(key, currentPartialWord, GS.maxWordSize);

      const word = nextState.finishedWord;
      if (word !== undefined) {
        input.word = word;
        input.prefix = "";
        input.letter = "";
        setGS(gs => {
          gs.lastScoredWord = word;
          gs.inputHistory.push(input);
          gs.currentInput = emptyInputItem;
        })
      }
      else if (nextState.currentPartialWord) {
        input.prefix = nextState.currentPartialWord;
        setGS(gs => {
          gs.currentInput = input;
        });
      }
      else { //score a bunch of sparse letters
        setGS(gs => {
          let prev = gs.inputHistory.at(-1);
          if (prev !== undefined && prev.letter == key) 
            prev.n += 1;
          else 
            gs.inputHistory.push({ letter: key, n: 1 });
          for (let l of currentPartialWord) {
            gs.inputHistory.push({ letter: l, n: 1 });
          }
          gs.currentInput = emptyInputItem;
        });
      }

      setGS(gs => {
        gs.lastPressed = key;
        gs.glyphs++;
      });
    }
  }

  /**************************************************************************/
  // Keyboard clicks

  const keyboardClick = (key: string) => {
    if (GS.repeatSelectMode && GS.repeatableKeys.has(key)) {
      setGS(gs => {
        gs.repeatKeys.has(key) ?
        gs.repeatKeys.delete(key) :
        gs.repeatKeys.add(key)
      });
    }
    /*
    // old style key purchase. To delete
    else if (GS.unlockAvailable && !GS.availableKeys.has(key)) {
      setGS(gs => {
        gs.unlockAvailable = false;
        gs.availableKeys.add(key);
      });
    }
    */
    else if (GS.repeatAvailable && !GS.repeatableKeys.has(key)) {
      setGS(gs => {
        gs.repeatAvailable = false;
        gs.repeatableKeys.add(key);
      });
    }
  }

  const repeatModeClick = () => {
    setGS(gs => { gs.repeatSelectMode = !gs.repeatSelectMode });
  }

  const fkeyCallback = (fkey: string) => {
    console.log(fkey + " pressed.");
  }

  /**************************************************************************/

  if (doProcessTimeouts) {
    setDoProcessTimeouts(false);
    processTimeouts();
  }

  return (
    <>
      <div className={styles.game}>
        <DictArea
          maxWordSize={GS.maxWordSize}
          items={GameData.dict} />
        <div className={styles.gameMain}>
          {/* // Fake inputarea
          <InputArea prevInput={fs.testPrevInput} partialInput={fs.testCurrentInput} />
          */}
          <InputArea prevInput={GS.inputHistory} partialInput={GS.currentInput} />
          <Keyboard
            keyStatus={getKeyStatus(GameData.keyInfo, GS.glyphs, GS.availableKeys, GS.repeatableKeys,
              GS.repeatSelectMode, GS.repeatAvailable)}
            functionKeyStatus={[]}
            clickCallback={keyboardClick}
            fkeyCallback={fkeyCallback}
            lastPressedKey={GS.lastPressed}
            pressedKeys={pressedKeys} />
        </div>
  {/*   // Fake Keyboard
          <Keyboard
            keyStatus={fs.keyStati}
            functionKeyStatus={fs.functionKeyStati}
            clickCallback={keyboardClick}
            fkeyCallback={fkeyCallback}
            focusedKey={fs.fakeFocusedKey}
            pressedKeys={fs.fakePressedKeys} />
        </div>
  */}
        <MultiFooter items={[
          <Log log={GS.log}></Log>,
          <button className={styles.resetButton} onClick={reset}>RESET</button>,
          <RCScout />,
          <Debug GS={GS} />
        ]} />
      </div >
    </>
  );
};

export default GameArea;
  /*
      <Shop score={GS.score}
            shopItems={GameData.shopEntries}
            visibleShopItems={GS.visibleShopItems}
            activeShopItems={GS.activeShopItems}
            callback={shopClick}></Shop>
  */
  /*
      {GS.inputVisible &&
      <WordTest currentPartialWord={GS.currentPartialWord} lastWord={GS.lastScoredWord} />}
  */   
