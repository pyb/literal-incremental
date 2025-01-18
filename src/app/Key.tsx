'use client'

import React, { useEffect } from "react";
import { Kbd } from "@chakra-ui/react"
import styles from "./page.module.css"

export interface KeyInfo {
  key: string,
  visibilityPrice: number,
  price: number,
  repeaterPrice: number
}

export interface Keys {
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

export default Key;