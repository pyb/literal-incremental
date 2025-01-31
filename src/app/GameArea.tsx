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

import { KeyInfo, GameData, UIData, ShopEntry, ShopAction } from "./GameData";
import { GameState, initialGameState} from "./GameState";
import { nextWordState } from "./word";
import { load, save } from "./persist";

import Keyboard, { KeyStatus, KeyMode } from "./Keyboard";
import ScoreBoard from "./ScoreBoard";
import DictArea from "./DictArea";
import {InputItem, InputArea} from "./InputArea";
import Log, { LogItem } from "./Log";
import Shop from "./Shop";

/**************************************************************/

const getKeyMode = (key: string, boughtKeys: Set<string>, repeatableKeys: Set<string>,
  repeatAvailable: boolean, unlockAvailable: boolean, repeatSelectMode: boolean) => {
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

// TODO : move to Keyboard.tsx?
const getKeyStatus = (keyInfo: Array<KeyInfo>,
  boughtKeys: Set<string>, repeatableKeys: Set<string>, repeatSelectMode: boolean,
  repeatAvailable: boolean, unlockAvailable: boolean, score: number): KeyStatus[] => {
  const visibleKeys = keyInfo.filter((key) => (score >= key.visibilityPrice));
  return visibleKeys.map(
    (kInfo: KeyInfo): KeyStatus => ({
      key: kInfo.key,
      mode: getKeyMode(kInfo.key, boughtKeys, repeatableKeys, repeatAvailable, unlockAvailable, repeatSelectMode)
    })
  );
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

  const handleKey = (key: string) => {
    if (GS.boughtKeys.has(key)) {
      let buffer = GS.inputBuffer;
      if (buffer.length == GameData.inputSize) {
        buffer = buffer.slice(GameData.inputSize / 2, GameData.inputSize);
      }

      const nextState = nextWordState(key, GS.currentPartialWord, GS.maxWordSize);
      if (nextState.finishedWord) {
        setGS(gs => {
          gs.lastScoredWord = nextState.finishedWord;
          gs.words++
        });
      }

      setGS(gs => {
        gs.inputBuffer = buffer + key;
        gs.currentPartialWord = nextState.currentPartialWord;
        gs.lastPressed = key;
        gs.glyphs++;
        gs.score += GameData.keyScores[key];
      });

      // TODO : maybe move this to shop component
      for (const entry of GameData.shopEntries) {
        if ((GS.glyphs + 1) >= entry.visibilityPrice)
          setGS(gs => { gs.visibleShopItems.add(entry.index) });
      }
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
    else if (GS.unlockAvailable && !GS.boughtKeys.has(key)) {
      setGS(gs => {
        gs.unlockAvailable = false;
        gs.boughtKeys.add(key);
      });
    }
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
  // Shop

  const shopClick = (action: ShopAction, n: number, index: number, shopEntries: Array<ShopEntry>) => {
    const entry: ShopEntry = shopEntries[index];
    const price = entry.price;

    if (!GS.activeShopItems.has(index) && (GS.glyphs >= price)) {
      setGS(gs => {
        gs.glyphs -= price;
        gs.activeShopItems.add(index)
      });
      addLog("Bought : " + entry.text + " for " + price);
      // TODO : Insert side effects here
      switch (action) {
        case ShopAction.LETTERUNLOCK:
          setGS(gs => { gs.unlockAvailable = true });
          break;
        case ShopAction.WORDUNLOCK:
          console.assert(n == (GS.maxWordSize + 1), n, GS.maxWordSize);
          setGS(gs => {
            gs.inputVisible = true;
            gs.maxWordSize = n
          }); // should always be maxWordSize+1
          break;
        case ShopAction.REPEATUNLOCK:
          setGS(gs => { gs.repeatAvailable = true });
          break;
        default:
      }
    }
  }

  /**************************************************************************/

  if (doProcessTimeouts) {
    setDoProcessTimeouts(false);
    processTimeouts();
  }


  //     


  /*
  return (
    <>
      <Log log={GS.log}></Log>
      <ScoreBoard score={GS.score} glyphs={GS.glyphs} words={GS.words} maxWordSize={GS.maxWordSize}/>
      <DictArea />
      {GS.inputVisible &&

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
                pressedKeys={pressedKeys}/>
      {GS.inputVisible &&
      <InputArea input={GS.inputBuffer} />}
      <button onClick={reset}>RESET</button>
    </>
  );
  */
  
  /*
      {GS.inputVisible &&
      <WordTest currentPartialWord={GS.currentPartialWord} lastWord={GS.lastScoredWord} />}
  */       

  const testPrevInput: Array<InputItem> = [
    {letter: "i", word: "", score: 10, key: 0},
    {letter: "n", word: "", score: 10, key: 1},
    {letter: "", word: "baz", score: 10, key: 2},
    {letter: "", word: "qux", score: 10, key: 3},
    {letter: "t", word: "", score: 10, key: 4},
  ];

  const testCurrentInput:InputItem = {
    letter: "",
    word: "fol",
    score: 0,
    key: 100
  };

  /*
  <InputArea input={GS.inputBuffer} />
  */
  /*
  return (
    <Keyboard
      allKeyStatus={getKeyStatus(GameData.keyInfo, GS.boughtKeys, GS.repeatableKeys,
                                 GS.repeatSelectMode, GS.repeatAvailable, GS.unlockAvailable, GS.score)}
      clickCallback={keyboardClick}
      repeatModeCallback={repeatModeClick}
      repeatVisible={true}
      focusedKey={GS.lastPressed}
      pressedKeys={pressedKeys} />
  );
  */
  const keyStati = [
    {key: "a", mode: KeyMode.VISIBLE},
    {key: "b", mode: KeyMode.BOUGHT},
    {key: "c", mode: KeyMode.BOUGHT},
    {key: "d", mode: KeyMode.PURCHASEABLE},
  ];

  const functionKeyStati = [
    {key: "tab", mode: KeyMode.FUNCTION_TOGGLED},
    {key: "rpt", mode: KeyMode.FUNCTION_VISIBLE},
  ];

  return (
    <Keyboard
      keyStatus={keyStati}
      functionKeyStatus={functionKeyStati}
      clickCallback={keyboardClick}
      fkeyCallback={fkeyCallback}
      focusedKey={"b"}
      pressedKeys={new Set(["b"])} />
  );
};

/*
  return (
    <div className={styles.game}>
      <div className={styles.gameHeader}>
        <DictArea />
        <ScoreBoard score={GS.score} glyphs={GS.glyphs} words={GS.words} maxWordSize={GS.maxWordSize} />
      </div>
      <div className={styles.gameMain}>
        <Keyboard allKeyStatus={getKeyStatus(GameData.keyInfo, GS.boughtKeys, GS.repeatableKeys,
          GS.repeatSelectMode, GS.repeatAvailable, GS.unlockAvailable, GS.score)}
          clickCallback={keyboardClick}
          repeatModeCallback={repeatModeClick}
          repeatVisible={true}
          focusedKey={GS.lastPressed}
          pressedKeys={pressedKeys} />
        <InputArea prevInput={testPrevInput} currentInput={testCurrentInput} /> 
        
      </div>
      <MultiFooter items={[
        <Log log={GS.log}></Log>,
        <button className={styles.resetButton} onClick={reset}>RESET</button>,
        <RCScout />
      ]} />
    </div>
  );
};
*/

export default GameArea;
