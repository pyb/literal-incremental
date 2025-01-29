'use client'

// 'etaoin schrldu'

import styles from "./game.module.css";

import React, { useState, useRef, useEffect} from "react";
import { enableMapSet} from "immer";
enableMapSet(); // immer setup call, to make Maps and Sets work
import { useImmer } from "use-immer";
/*
import { animate, motion, useMotionValue, useTransform } from "motion/react";
*/

import { KeyInfo, GameData, UIData, ShopEntry, ShopAction } from "./GameData";
import { GameState, initialGameState } from "./GameState";
import { nextWordState } from "./word";
import {load, save} from "./persist";

import Keyboard, { KeyStatus, KeyMode } from "./Keyboard";
import ScoreBoard from "./ScoreBoard";
import DictArea from "./DictArea";
import InputArea from "./InputArea";
import Log from "./Log";
import Shop from "./Shop";

/**************************************************************/

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

// TODO : move to Keyboard.tsx?
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

/**************************************************************/

const GameArea = () => {
  const [GS, setGS] = useImmer<GameState>(initialGameState);

  // Utility function
  const addLog = (message: string) => {
    setGS(gs => {
      gs.log.splice(0, 1) // remove first
      gs.log.push(message)
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
  const [pressedKeys,setPressedKeys] = useState<Set<string>>(new Set<string>());

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

  useEffect(() => {;
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
        setGS(gs => {gs.lastScoredWord = nextState.finishedWord;
                     gs.words++});
        }

      setGS(gs => {
        gs.inputBuffer = buffer + key;
        gs.currentPartialWord = nextState.currentPartialWord;
        gs.lastPressed = key;
        gs.glyphs++;
        gs.score += GameData.keyScores[key]; });
  
      // TODO : maybe move this to shop component
      for (const entry of GameData.shopEntries) {
        if ((GS.glyphs + 1) >= entry.visibilityPrice)
          setGS(gs => {gs.visibleShopItems.add(entry.index)});
      }
    }
  }

  /**************************************************************************/
  // Keyboard clicks

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
  
  const repeatModeClick = () => {
    setGS(gs => {gs.repeatSelectMode = !gs.repeatSelectMode});
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

  /**************************************************************************/

  if (doProcessTimeouts)
  {
    setDoProcessTimeouts(false);
    processTimeouts();
  }
  
  const scoutHTML = '<div class="rc-scout-wrapper"><div class="rc-scout" data-scout-rendered="true"><p class="rc-scout__text"><i class="rc-scout__logo"></i> Want to become a better programmer? <a class="rc-scout__link" href="https://www.recurse.com/scout/click?t=af9a73dda60f0a29147b1aaddbc4a088">Join the Recurse Center!</a></p></div> <style class="rc-scout__style" type="text/css">.rc-scout { display: block; padding: 0; border: 0; margin: 0; } .rc-scout__text { display: block; padding: 0; border: 0; margin: 0; height: 100%; font-size: 100%; } .rc-scout__logo { display: inline-block; padding: 0; border: 0; margin: 0; width: 0.85em; height: 0.85em; background: no-repeat center url(\'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2012%2015%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2212%22%20height%3D%2210%22%20fill%3D%22%23000%22%3E%3C%2Frect%3E%3Crect%20x%3D%221%22%20y%3D%221%22%20width%3D%2210%22%20height%3D%228%22%20fill%3D%22%23fff%22%3E%3C%2Frect%3E%3Crect%20x%3D%222%22%20y%3D%222%22%20width%3D%228%22%20height%3D%226%22%20fill%3D%22%23000%22%3E%3C%2Frect%3E%3Crect%20x%3D%222%22%20y%3D%223%22%20width%3D%221%22%20height%3D%221%22%20fill%3D%22%233dc06c%22%3E%3C%2Frect%3E%3Crect%20x%3D%224%22%20y%3D%223%22%20width%3D%221%22%20height%3D%221%22%20fill%3D%22%233dc06c%22%3E%3C%2Frect%3E%3Crect%20x%3D%226%22%20y%3D%223%22%20width%3D%221%22%20height%3D%221%22%20fill%3D%22%233dc06c%22%3E%3C%2Frect%3E%3Crect%20x%3D%223%22%20y%3D%225%22%20width%3D%222%22%20height%3D%221%22%20fill%3D%22%233dc06c%22%3E%3C%2Frect%3E%3Crect%20x%3D%226%22%20y%3D%225%22%20width%3D%222%22%20height%3D%221%22%20fill%3D%22%233dc06c%22%3E%3C%2Frect%3E%3Crect%20x%3D%224%22%20y%3D%229%22%20width%3D%224%22%20height%3D%223%22%20fill%3D%22%23000%22%3E%3C%2Frect%3E%3Crect%20x%3D%221%22%20y%3D%2211%22%20width%3D%2210%22%20height%3D%224%22%20fill%3D%22%23000%22%3E%3C%2Frect%3E%3Crect%20x%3D%220%22%20y%3D%2212%22%20width%3D%2212%22%20height%3D%223%22%20fill%3D%22%23000%22%3E%3C%2Frect%3E%3Crect%20x%3D%222%22%20y%3D%2213%22%20width%3D%221%22%20height%3D%221%22%20fill%3D%22%23fff%22%3E%3C%2Frect%3E%3Crect%20x%3D%223%22%20y%3D%2212%22%20width%3D%221%22%20height%3D%221%22%20fill%3D%22%23fff%22%3E%3C%2Frect%3E%3Crect%20x%3D%224%22%20y%3D%2213%22%20width%3D%221%22%20height%3D%221%22%20fill%3D%22%23fff%22%3E%3C%2Frect%3E%3Crect%20x%3D%225%22%20y%3D%2212%22%20width%3D%221%22%20height%3D%221%22%20fill%3D%22%23fff%22%3E%3C%2Frect%3E%3Crect%20x%3D%226%22%20y%3D%2213%22%20width%3D%221%22%20height%3D%221%22%20fill%3D%22%23fff%22%3E%3C%2Frect%3E%3Crect%20x%3D%227%22%20y%3D%2212%22%20width%3D%221%22%20height%3D%221%22%20fill%3D%22%23fff%22%3E%3C%2Frect%3E%3Crect%20x%3D%228%22%20y%3D%2213%22%20width%3D%221%22%20height%3D%221%22%20fill%3D%22%23fff%22%3E%3C%2Frect%3E%3Crect%20x%3D%229%22%20y%3D%2212%22%20width%3D%221%22%20height%3D%221%22%20fill%3D%22%23fff%22%3E%3C%2Frect%3E%3C%2Fsvg%3E\'); } .rc-scout__link:link, .rc-scout__link:visited { color: #3dc06c; text-decoration: underline; } .rc-scout__link:hover, .rc-scout__link:active { color: #4e8b1d; }</style></div>';

  const Scout = () => {
    return (
      <div dangerouslySetInnerHTML={{__html: scoutHTML}}></div>
    );}

  interface FooterProps {
    children: React.ReactNode;
  };

  const Footer = ({children}: FooterProps) => {
    return (<>
      {children}
    </>)
  }

  /*
  return (
    <>
      <Log log={GS.log}></Log>
      <ScoreBoard score={GS.score} glyphs={GS.glyphs} words={GS.words} maxWordSize={GS.maxWordSize}/>
      <DictArea />
      {GS.inputVisible &&
      <WordTest currentPartialWord={GS.currentPartialWord} lastWord={GS.lastScoredWord} />}
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
//  <div className={styles.game}>
  return (
    <>
      <ScoreBoard score={GS.score} glyphs={GS.glyphs} words={GS.words} maxWordSize={GS.maxWordSize}/>
      <DictArea />
      {GS.inputVisible &&
      <WordTest currentPartialWord={GS.currentPartialWord} lastWord={GS.lastScoredWord} />}
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
      <Footer>
        <Log log={GS.log}></Log>
        <button onClick={reset}>RESET</button>
        <Scout />
      </Footer>
    </>
  );
};

export default GameArea;
