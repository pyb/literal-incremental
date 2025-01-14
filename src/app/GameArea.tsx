'use client'

import styles from "./page.module.css"
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button"
import { HStack, Kbd } from "@chakra-ui/react"

import Keyboard from "./Keyboard"

const GameArea = () => {
  const [glyphs, setGlyphs] = React.useState<number>(0);
  const [lastPressed, setLastPressed] = React.useState<string>("");
  const [highlight, setHighlight] = React.useState<boolean>(false);
  const interval = React.useRef<number>(0);

  const availableKeys = new Set<string>(['i', 's', 'p']);

  // Saving for valid word recognition
  // const checkPartialWord = (partialWord: string, dictionary: Set<string>) => {
  //   for (let word of dictionary)
  //   {
  //     const len = partialWord.length;
  //     const w = word.slice(0, len);
  //     if (partialWord == w)
  //       return true;
  //   }
  //   return false;
  // }

  useEffect(() => {
    const handlePress = (e: any) => {
      console.log(e.key)
      if (e.key.length == 1 && e.key >= 'a' && e.key <='z') {
        
        if (availableKeys.has(e.key)) {
          setGlyphs(glyphs + 1)
          setLastPressed(e.key);
          setHighlight(true);
          window.setTimeout(() => {
            setHighlight(false)
            console.log('setting interval to false')
          }, 150)
          console.log(interval.current)
        }
      }
    };
    window.addEventListener('keydown', handlePress);

    return () => {
      window.removeEventListener('keydown', handlePress);
    };
  }, [glyphs]);


  return (
    <div>
      <h1>Literal Incremental</h1>
      <span>glyphs: {glyphs}</span>
      <Keyboard keys={['i', 's', 'p']} focus={highlight ? lastPressed : ""}/>
    </div>
  )
}

export default GameArea;