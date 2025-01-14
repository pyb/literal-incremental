'use client'

import React, { useEffect } from "react";
import { Kbd } from "@chakra-ui/react"
import styles from "./page.module.css"
import { KeyMode } from "./GameArea";

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