'use client'

import React, { useEffect } from "react";
import { HStack, StackSeparator, Kbd } from "@chakra-ui/react"
import styles from "./page.module.css"

export interface KeyStatus {
  letter: string,
  mode: KeyMode
}

export enum KeyMode {
  BOUGHT,
  VISIBLE
}

const Key = ({ letter, highlight, mode } : { letter: string, highlight: boolean, mode: KeyMode }) => {
  return (
    <Kbd size='lg' variant={highlight ? 'subtle' : 'raised'} colorPalette={mode == KeyMode.VISIBLE ? 'gray' : (highlight ? 'yellow' : 'orange')}>
      <div className={styles.KbdKey}>
        {letter}
        </div>
    </Kbd>
  )
}

const Keyboard = ({keyModes, focus}: {keyModes: KeyStatus[], focus: string}) => {
  return (
    <HStack separator={<StackSeparator />}>
      {keyModes.map((keyStatus: KeyStatus) =>
       <Key key={keyStatus.letter} highlight={(keyStatus.letter == focus)? true : false}
            letter={keyStatus.letter} mode={keyStatus.mode}/>)} 
    </HStack>
  )
}

export default Keyboard;