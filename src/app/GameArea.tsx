'use client'

// 'etaoin schrldu'

import styles from "./page.module.css"
import React, { useState, useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react"
import Keyboard, { KeyStatus, KeyMode } from "./Keyboard"

const highlightDuration = 150;

interface KeyInfo {
  key: string,
  visibilityPrice: number,
  price: number,
  repeaterPrice: number
}

const keyInfo = [
  { key: 'i', visibilityPrice: 0, price: 0, repeaterPrice: 500 },
  { key: 's', visibilityPrice: 10, price: 100, repeaterPrice: 5000 },
  { key: 'n', visibilityPrice: 150, price: 200, repeaterPrice: 50000 },
  { key: 'c', visibilityPrice: 200, price: 300, repeaterPrice: 500000 },
  { key: 'h', visibilityPrice: 350, price: 500, repeaterPrice: 5000000 },
  { key: 'o', visibilityPrice: 600, price: 750, repeaterPrice: 50000000 },
  { key: 'r', visibilityPrice: 800, price: 1000, repeaterPrice: 500000000 },
]

const ScoreBoard = ({glyphs} : {glyphs: number}) =>
{
  return (
  <div>Glyphs score : {glyphs}</div>
  );
}

const GameArea = () => {
  const [glyphs, setGlyphs] = useState<number>(0);
  const [lastPressed, setLastPressed] = useState<string>("");
  const [highlight, setHighlight] = useState<boolean>(false);
  const [boughtKeys, setBoughtKeys] = useState<Array<string>>(['i'])

  const handleKeydown = (kev: KeyboardEvent) => {
    //const kev = ev as KeyboardEvent;
    let key:string = kev.key;
    console.log(key)
    if (key.length == 1 && 
        ( (key >= 'a' && key <= 'z') ||
          (key >= 'A' && key <= '|') ) &&
        boughtKeys.includes(key.toLowerCase())) {
      key = key.toLowerCase();
      setGlyphs(glyphs + 1)
      setLastPressed(key);
      setHighlight(true);
      window.setTimeout(() => {
        setHighlight(false)
      }, highlightDuration)
    }
  }
  useEffect(() => {
    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [glyphs]);

  const keyModes = (keyInfo: Array<KeyInfo>, boughtKeys: Array<string>, score: number): KeyStatus[] => {
    const visibleKeys = keyInfo.filter((key) => (score >= key.visibilityPrice));
    return visibleKeys.map(
      (kInfo: KeyInfo) :KeyStatus => ({
        letter: kInfo.key,
        mode: (boughtKeys.includes(kInfo.key) ? KeyMode.BOUGHT : KeyMode.VISIBLE)
    })
    );
  }

  return (
    <div>
      <h1>Literal Incremental!</h1>
      {/* <TestArea /> */}
      <ScoreBoard glyphs={glyphs}/>
      <Keyboard keyModes={keyModes(keyInfo, boughtKeys, glyphs)} focus={highlight ? lastPressed : ""} />
    </div>
  )
}

// Saving for valid word recognition
/* 
const checkPartialWord = (partialWord: string, dictionary: Set<string>) => {
  for (let word of dictionary) {
    const len = partialWord.length;
    const w = word.slice(0, len);
    if (partialWord == w)
      return true;
  }
  return false;
}
 */
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
