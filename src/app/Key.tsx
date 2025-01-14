'use client'

import React, { useEffect } from "react";
import { Kbd } from "@chakra-ui/react"
import styles from "./page.module.css"

const Key = ({ letter, highlight } : { letter: string, highlight: boolean }) => {
  
  
  return (
    <Kbd size='lg' variant={highlight ? 'subtle' : 'raised'} colorPalette={highlight ? 'yellow' : 'orange'}>
      <div className={styles.KbdKey}>
        {letter}
        </div>
    </Kbd>
  )
}

export default Key;